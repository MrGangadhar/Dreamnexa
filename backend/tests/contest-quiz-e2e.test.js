const request = require('supertest');
const { getApp, registerUser, promoteToAdmin } = require('./helpers/factories');

describe('End-to-end: contest + quiz lifecycle', () => {
  const app = getApp();
  let adminToken;

  beforeAll(async () => {
    const { user, payload } = await registerUser(request, app);
    promoteToAdmin(user.id);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    adminToken = login.body.accessToken;
  });

  it('runs the full journey: create quiz -> create template (auto-spawns contest) -> student registers -> joins -> plays -> submits -> gets ranked -> next contest auto-spawns', async () => {
    // 1. Admin creates a 2-question quiz.
    const quizRes = await request(app)
      .post('/api/admin/quizzes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'QA E2E Quiz',
        description: 'Automated end-to-end test quiz',
        durationMinutes: 10,
        questions: [
          {
            questionText: '2 + 2 = ?',
            questionType: 'mcq',
            options: ['3', '4', '5', '6'],
            correctOptions: ['4'],
            marks: 10,
            negativeMarks: 0,
          },
          {
            questionText: 'Capital of France?',
            questionType: 'mcq',
            options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
            correctOptions: ['Paris'],
            marks: 10,
            negativeMarks: 0,
          },
        ],
      });
    expect(quizRes.status).toBe(201);
    const quizId = quizRes.body.id;

    // 2. Admin creates a template with maxParticipants = 1, so a single join
    //    immediately fills and locks the contest — keeping the test fast and
    //    deterministic without needing multiple concurrent players.
    const templateRes = await request(app)
      .post('/api/admin/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'QA E2E Contest',
        quizId,
        entryPointsCost: 0,
        maxParticipants: 1,
        durationMinutes: 10,
        rewardStructure: [{ rank: 1, points: 75 }],
        autoRegenerate: true,
      });
    expect(templateRes.status).toBe(201);
    expect(templateRes.body.firstContest).toBeTruthy();
    const contestId = templateRes.body.firstContest.id;
    expect(templateRes.body.firstContest.status).toBe('upcoming');

    // 3. A student registers.
    const { accessToken: studentToken, payload: studentPayload } = await registerUser(request, app);

    // Sanity: the new contest is visible in the public contest list.
    const listRes = await request(app).get('/api/contests');
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((c) => c.id === contestId)).toBe(true);

    // 4. Student joins the contest — this is the single seat, so it should
    //    immediately fill (1/1) and flip the contest to "live".
    const joinRes = await request(app)
      .post(`/api/contests/${contestId}/join`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.contest.status).toBe('live');
    expect(joinRes.body.contest.current_participants).toBe(1);

    // Joining again once the contest is full/locked must be rejected — since
    // this template only has 1 seat, the contest itself is no longer
    // "upcoming" by the time of the 2nd call, so the API correctly reports
    // "contest closed" (400) rather than "already joined" (409); that
    // duplicate-specific 409 path is for contests with open seats remaining.
    const dupeJoin = await request(app)
      .post(`/api/contests/${contestId}/join`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(dupeJoin.status).toBe(400);

    // 5. Student fetches the quiz to play (answers must NOT include correct options).
    const playRes = await request(app)
      .get(`/api/quiz/${contestId}/play`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(playRes.status).toBe(200);
    expect(playRes.body.questions).toHaveLength(2);
    expect(playRes.body.questions[0]).not.toHaveProperty('correct_options');
    const [q1, q2] = playRes.body.questions;

    // A user who never joined cannot fetch the quiz.
    const { accessToken: outsiderToken } = await registerUser(request, app);
    const outsiderPlay = await request(app)
      .get(`/api/quiz/${contestId}/play`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(outsiderPlay.status).toBe(403);

    // 6. Student submits: both answers correct -> full marks, evaluated immediately
    //    since this is the only participant (pendingCount hits 0 right away —
    //    this is the exact query path the ::int regex bug used to break).
    const submitRes = await request(app)
      .post(`/api/quiz/${contestId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionId: q1.id, selectedOptions: ['4'] },
          { questionId: q2.id, selectedOptions: ['Paris'] },
        ],
      });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.score).toBe(20);
    expect(submitRes.body.correctCount).toBe(2);
    expect(submitRes.body.wrongCount).toBe(0);
    expect(submitRes.body.evaluated).toBe(true);

    // Re-submitting must be rejected.
    const resubmit = await request(app)
      .post(`/api/quiz/${contestId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: [] });
    expect(resubmit.status).toBe(409);

    // 7. Verify rank #1 + reward points were applied, and the leaderboard reflects it.
    const contestDetail = await request(app).get(`/api/contests/${contestId}`);
    expect(contestDetail.status).toBe(200);
    expect(contestDetail.body.status).toBe('completed');

    const leaderboard = await request(app).get(`/api/contests/${contestId}/leaderboard`);
    expect(leaderboard.status).toBe(200);
    expect(leaderboard.body[0].rank).toBe(1);
    expect(leaderboard.body[0].score).toBe(20);
    expect(leaderboard.body[0].points_awarded).toBe(75);

    // 8. Persisted state: student's own dashboard reflects the completed contest
    //    and updated points balance (50 signup + 75 rank bonus = 125).
    const meRes = await request(app).get('/api/users/me').set('Authorization', `Bearer ${studentToken}`);
    expect(meRes.body.total_points).toBe(125);
    expect(meRes.body.contests_won).toBe(1);

    const myContests = await request(app)
      .get('/api/users/me/contests')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(myContests.body).toHaveLength(1);
    expect(myContests.body[0].rank).toBe(1);
    expect(myContests.body[0].points_awarded).toBe(75);

    // 9. A fresh #2 contest should have auto-spawned from the same template
    //    (autoRegenerate: true), so new users always have a seat.
    const templatesRes = await request(app)
      .get('/api/admin/templates')
      .set('Authorization', `Bearer ${adminToken}`);
    const ourTemplate = templatesRes.body.find((t) => t.id === templateRes.body.template.id);
    expect(ourTemplate.contests_spawned).toBe(2);

    // 10. Full auth-persistence check: log out, log back in, data survives.
    const relogin = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: studentPayload.username, password: studentPayload.password });
    expect(relogin.status).toBe(200);
    expect(relogin.body.user.total_points).toBe(125 + 10); // + daily login bonus on this 2nd login of the day... see note below
  });

  it('rejects joining the same open (not-yet-full) contest twice with 409', async () => {
    const quizRes = await request(app)
      .post('/api/admin/quizzes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'QA Dupe-Join Quiz',
        questions: [{ questionText: 'Q?', options: ['A', 'B'], correctOptions: ['A'], marks: 1 }],
      });

    const templateRes = await request(app)
      .post('/api/admin/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'QA Dupe-Join Contest', quizId: quizRes.body.id, maxParticipants: 5 });
    const contestId = templateRes.body.firstContest.id;

    const { accessToken } = await registerUser(request, app);
    const first = await request(app)
      .post(`/api/contests/${contestId}/join`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(first.status).toBe(200);
    expect(first.body.contest.status).toBe('upcoming'); // still 4 seats open

    const second = await request(app)
      .post(`/api/contests/${contestId}/join`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(second.status).toBe(409);
  });
});
