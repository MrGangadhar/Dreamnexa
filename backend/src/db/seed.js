require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool, withTransaction } = require('./pool');
const contestEngine = require('../utils/contestEngine');
const pointsService = require('../utils/pointsService');
const { evaluateContest } = require('../utils/resultsEngine');

async function seed() {
  console.log('Seeding baseline data...');
  await withTransaction(async (client) => {
    const adminPass = await bcrypt.hash('Admin@12345', 10);
    const adminRes = await client.query(
      `INSERT INTO users (username, email, mobile, password_hash, role, email_verified)
       VALUES ('admin', 'admin@quizarena.app', '9999999999', $1, 'admin', true)
       ON CONFLICT (username) DO UPDATE SET password_hash = $1, role = 'admin'
       RETURNING id`,
      [adminPass]
    );
    const adminId = adminRes.rows[0].id;
    await client.query(
      `INSERT INTO profiles (user_id, full_name, referral_code)
       VALUES ($1, 'Platform Admin', 'ADMIN0001')
       ON CONFLICT (user_id) DO NOTHING`,
      [adminId]
    );

    // Badges
    const badges = [
      ['gold_scholar', 'Gold Scholar', 'Finished 1st in a contest', 'trophy-gold'],
      ['silver_scholar', 'Silver Scholar', 'Finished 2nd in a contest', 'trophy-silver'],
      ['bronze_scholar', 'Bronze Scholar', 'Finished 3rd in a contest', 'trophy-bronze'],
      ['quiz_streak_5', '5-Day Streak', 'Logged in 5 days in a row', 'flame'],
      ['first_contest', 'First Steps', 'Joined your first contest', 'flag'],
    ];
    for (const [code, name, description, icon] of badges) {
      await client.query(
        `INSERT INTO badges (code, name, description, icon)
         VALUES ($1,$2,$3,$4) ON CONFLICT (code) DO NOTHING`,
        [code, name, description, icon]
      );
    }

    // -------------------------------------------------------------
    // Helper: create a quiz + its questions, return quiz id
    // -------------------------------------------------------------
    async function createQuiz({ title, description, instructions, duration, negative, passing, questions }) {
      const quizRes = await client.query(
        `INSERT INTO quizzes (title, description, instructions, duration_minutes, negative_marking, passing_marks, is_published, proctoring_enabled, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,true,true,$7)
         RETURNING id`,
        [title, description, instructions, duration, negative, passing, adminId]
      );
      const quizId = quizRes.rows[0].id;
      let order = 0;
      for (const [text, opts, correct, explanation] of questions) {
        const options = opts.map((o) => ({ id: o[0], text: o.slice(3) }));
        order += 1;
        await client.query(
          `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_options, marks, negative_marks, explanation, order_index)
           VALUES ($1,$2,'mcq',$3,$4,1,$5,$6,$7)`,
          [quizId, text, JSON.stringify(options), JSON.stringify(correct), negative, explanation || null, order]
        );
      }
      return quizId;
    }

    // -------------------------------------------------------------
    // Helper: create a contest template AND immediately spawn its
    // first joinable contest (mirrors what adminController.createTemplate
    // does) — without this step the template never shows up as
    // something a student can actually join.
    // -------------------------------------------------------------
    async function createTemplateWithContest({ name, description, quizId, entryPointsCost, maxParticipants, duration, rewards }) {
      const tRes = await client.query(
        `INSERT INTO contest_templates
          (name, description, quiz_id, entry_points_cost, max_participants, duration_minutes, reward_structure, auto_regenerate, is_active, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true,true,$8)
         RETURNING *`,
        [name, description, quizId, entryPointsCost, maxParticipants, duration, JSON.stringify(rewards), adminId]
      );
      const template = tRes.rows[0];
      await contestEngine.ensureOpenContestExists(client, template.id);
      return template.id;
    }

    const standardRewards = [
      { rank: 1, badge: 'gold_scholar', points: 200 },
      { rank: 2, badge: 'silver_scholar', points: 120 },
      { rank: 3, badge: 'bronze_scholar', points: 60 },
    ];

    // === Quiz 1: General Knowledge Sprint (existing) ===============
    const gkQuizId = await createQuiz({
      title: 'General Knowledge Sprint',
      description: 'A fast-paced 10-question GK quiz for campus contests.',
      instructions: 'Answer all questions before the timer runs out. Each wrong answer deducts 0.25 marks.',
      duration: 10,
      negative: 0.25,
      passing: 4,
      questions: [
        ['Which planet is known as the Red Planet?', ['A) Earth', 'B) Mars', 'C) Jupiter', 'D) Venus'], ['B'], 'Mars appears red due to iron oxide on its surface.'],
        ['Who wrote the Indian National Anthem?', ['A) Bankim Chandra', 'B) Sarojini Naidu', 'C) Rabindranath Tagore', 'D) Subhas Chandra Bose'], ['C'], 'Rabindranath Tagore wrote "Jana Gana Mana".'],
        ['What is the capital of Karnataka?', ['A) Mysuru', 'B) Bengaluru', 'C) Hubballi', 'D) Mangaluru'], ['B'], 'Bengaluru has been the state capital since 1956.'],
        ['H2O is the chemical formula for?', ['A) Hydrogen Peroxide', 'B) Salt', 'C) Water', 'D) Oxygen'], ['C'], 'Two hydrogen atoms bond with one oxygen atom.'],
        ['The Great Wall is located in which country?', ['A) Japan', 'B) China', 'C) India', 'D) Mongolia'], ['B'], 'It stretches across northern China.'],
      ],
    });

    // === Quiz 2: Science & Tech Trivia ==============================
    const scienceQuizId = await createQuiz({
      title: 'Science & Tech Trivia',
      description: 'Quick-fire questions on science, space, and everyday technology.',
      instructions: 'Ten minutes on the clock — trust your first instinct.',
      duration: 10,
      negative: 0.25,
      passing: 4,
      questions: [
        ['What does "CPU" stand for?', ['A) Central Process Utility', 'B) Central Processing Unit', 'C) Computer Personal Unit', 'D) Core Processing Unit'], ['B'], 'The CPU is the primary component that executes instructions.'],
        ['Which gas do plants absorb from the atmosphere for photosynthesis?', ['A) Oxygen', 'B) Nitrogen', 'C) Carbon Dioxide', 'D) Hydrogen'], ['C'], 'Plants use CO2, water, and sunlight to make glucose.'],
        ['Who proposed the theory of general relativity?', ['A) Isaac Newton', 'B) Albert Einstein', 'C) Niels Bohr', 'D) Galileo Galilei'], ['B'], 'Einstein published it in 1915.'],
        ['What is the closest star to Earth?', ['A) Proxima Centauri', 'B) Sirius', 'C) The Sun', 'D) Alpha Centauri'], ['C'], 'The Sun is roughly 8 light-minutes away.'],
        ['Which company developed the Android operating system?', ['A) Apple', 'B) Microsoft', 'C) Google', 'D) Samsung'], ['C'], 'Google acquired Android Inc. in 2005.'],
      ],
    });

    // === Quiz 3: History Mock Test (longer, exam-style) =============
    const historyQuizId = await createQuiz({
      title: 'History Mock Test',
      description: 'An 8-question exam-style mock test covering world and Indian history.',
      instructions: 'Simulates exam conditions — negative marking applies, no going back once submitted.',
      duration: 15,
      negative: 0.33,
      passing: 5,
      questions: [
        ['In which year did India gain independence?', ['A) 1945', 'B) 1946', 'C) 1947', 'D) 1950'], ['C'], 'India became independent on 15 August 1947.'],
        ['Who was the first President of the United States?', ['A) Thomas Jefferson', 'B) George Washington', 'C) Abraham Lincoln', 'D) John Adams'], ['B'], 'Washington served from 1789 to 1797.'],
        ['The Renaissance began in which country?', ['A) France', 'B) Germany', 'C) Italy', 'D) Spain'], ['C'], 'It began in Florence in the 14th century.'],
        ['Who led the Salt March in 1930?', ['A) Jawaharlal Nehru', 'B) Mahatma Gandhi', 'C) Sardar Patel', 'D) Bhagat Singh'], ['B'], 'The Dandi March protested the British salt tax.'],
        ['World War II ended in which year?', ['A) 1943', 'B) 1944', 'C) 1945', 'D) 1946'], ['C'], 'It ended with Japan surrendering in September 1945.'],
        ['Who built the Taj Mahal?', ['A) Akbar', 'B) Shah Jahan', 'C) Aurangzeb', 'D) Humayun'], ['B'], 'Shah Jahan built it for Mumtaz Mahal.'],
        ['The French Revolution began in which year?', ['A) 1789', 'B) 1799', 'C) 1804', 'D) 1776'], ['A'], 'It began with the storming of the Bastille.'],
        ['Which empire was ruled by Genghis Khan?', ['A) Ottoman', 'B) Mongol', 'C) Roman', 'D) Persian'], ['B'], 'He founded the Mongol Empire in the 13th century.'],
      ],
    });

    // === Quiz 4: Current Affairs Daily ==============================
    const currentAffairsQuizId = await createQuiz({
      title: 'Current Affairs Daily',
      description: 'A short daily quiz to keep up with general current-affairs awareness.',
      instructions: 'Five quick questions — new set added regularly by admins.',
      duration: 5,
      negative: 0,
      passing: 3,
      questions: [
        ['Which country hosted the G20 Summit in 2023?', ['A) Indonesia', 'B) India', 'C) Brazil', 'D) Japan'], ['B'], 'India hosted the G20 Summit in New Delhi in 2023.'],
        ['ISRO is the space agency of which country?', ['A) India', 'B) Israel', 'C) Iran', 'D) Indonesia'], ['A'], 'ISRO stands for the Indian Space Research Organisation.'],
        ['The Reserve Bank of India regulates which sector?', ['A) Telecom', 'B) Banking', 'C) Railways', 'D) Aviation'], ['B'], 'RBI is India\'s central banking institution.'],
        ['Which is the largest democracy in the world by population?', ['A) USA', 'B) India', 'C) Indonesia', 'D) Brazil'], ['B'], 'India is the world\'s most populous democracy.'],
        ['The United Nations headquarters is located in which city?', ['A) Geneva', 'B) Paris', 'C) New York', 'D) London'], ['C'], 'UN headquarters sits on the East River in Manhattan.'],
      ],
    });

    // === Quiz 5: Sports Trivia =======================================
    const sportsQuizId = await createQuiz({
      title: 'Sports Trivia Challenge',
      description: 'Test your knowledge of cricket, football, the Olympics, and more.',
      instructions: 'Answer as many as you can before time runs out.',
      duration: 10,
      negative: 0.25,
      passing: 4,
      questions: [
        ['How many players are on a cricket team during a match?', ['A) 9', 'B) 10', 'C) 11', 'D) 12'], ['C'], 'Each side fields 11 players.'],
        ['The FIFA World Cup is held every how many years?', ['A) 2', 'B) 3', 'C) 4', 'D) 5'], ['C'], 'It has run on a four-year cycle since 1930.'],
        ['Which country has won the most Olympic gold medals overall?', ['A) China', 'B) Russia', 'C) USA', 'D) UK'], ['C'], 'The USA leads the all-time Olympic gold medal count.'],
        ['In tennis, what score is also called "love"?', ['A) 15', 'B) 30', 'C) 40', 'D) 0'], ['D'], 'A score of zero is called "love" in tennis.'],
        ['Which Indian city hosted the 2010 Commonwealth Games?', ['A) Mumbai', 'B) New Delhi', 'C) Chennai', 'D) Bengaluru'], ['B'], 'New Delhi hosted the games in October 2010.'],
      ],
    });

    // -------------------------------------------------------------
    // Contest templates — spread across free (Daily Quiz page) and
    // points-entry (Mock Tests page) so both sections have content.
    // -------------------------------------------------------------
    const gkTemplateId = await createTemplateWithContest({
      name: 'Campus GK Sprint',
      description: 'Free 6-player quiz sprint. Fill all seats to start instantly.',
      quizId: gkQuizId, entryPointsCost: 0, maxParticipants: 6, duration: 10, rewards: standardRewards,
    });

    const scienceTemplateId = await createTemplateWithContest({
      name: 'Science & Tech Sprint',
      description: 'Free 6-player science and technology sprint.',
      quizId: scienceQuizId, entryPointsCost: 0, maxParticipants: 6, duration: 10, rewards: standardRewards,
    });

    await createTemplateWithContest({
      name: 'Daily Current Affairs Quiz',
      description: 'A free daily quiz — new questions added regularly, no entry cost.',
      quizId: currentAffairsQuizId, entryPointsCost: 0, maxParticipants: 8, duration: 5, rewards: standardRewards,
    });

    await createTemplateWithContest({
      name: 'History Mock Test',
      description: 'Exam-style mock test. Costs 50 points (earned free) to enter, higher rewards.',
      quizId: historyQuizId, entryPointsCost: 50, maxParticipants: 10, duration: 15,
      rewards: [
        { rank: 1, badge: 'gold_scholar', points: 400 },
        { rank: 2, badge: 'silver_scholar', points: 250 },
        { rank: 3, badge: 'bronze_scholar', points: 120 },
      ],
    });

    await createTemplateWithContest({
      name: 'Sports Trivia Test',
      description: 'Points-entry sports trivia test for bragging rights and bonus points.',
      quizId: sportsQuizId, entryPointsCost: 30, maxParticipants: 8, duration: 10,
      rewards: [
        { rank: 1, badge: 'gold_scholar', points: 300 },
        { rank: 2, badge: 'silver_scholar', points: 180 },
        { rank: 3, badge: 'bronze_scholar', points: 90 },
      ],
    });

    // -------------------------------------------------------------
    // Sample news & vlog content for the News page
    // -------------------------------------------------------------
    const articles = [
      {
        title: 'DreamNexa Launches Daily Current Affairs Quiz',
        description: 'A new free daily quiz section is now live for all students.',
        content: 'DreamNexa has rolled out a new free, no-entry-cost Daily Current Affairs Quiz so students can build a quick daily habit of testing their general awareness. New questions are refreshed regularly by the admin team, and every completed quiz earns bonus points that can be used to enter higher-value contests.',
        category: 'platform', type: 'news', featured: 1,
      },
      {
        title: 'How to Prepare for Campus Quiz Contests',
        description: 'Five tips to help you climb the leaderboard.',
        content: 'Consistent daily practice matters more than last-minute cramming. Start with the free sprint quizzes to build speed and accuracy, review the explanation shown after each question, and track which topics cost you the most points so you can focus your next study session there.',
        category: 'tips', type: 'news', featured: 0,
      },
      {
        title: 'Understanding AI Proctoring on DreamNexa',
        description: 'What gets checked when you join a proctored contest, and why.',
        content: 'Proctored contests use on-device checks: a visible face, a stable fullscreen window, and no tab switching, to help keep results fair for every participant. No video or audio is ever recorded or uploaded; only short derived signals are sent to the server, and only unusual sessions are ever flagged for manual admin review.',
        category: 'platform', type: 'news', featured: 1,
      },
      {
        title: 'Weekly Recap: Top Scorers on the Campus GK Sprint',
        description: 'A look back at this week\'s most active quiz contest.',
        content: 'The Campus GK Sprint continues to be the most-joined free contest on the platform this week, with seats filling within minutes of each new round opening. Congratulations to everyone who placed on the leaderboard, and keep an eye on the Contests page for the next round.',
        category: 'community', type: 'vlog', vlogUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', featured: 0,
      },
      {
        title: 'Vlog: 3 Study Habits of Our Top-Ranked Players',
        description: 'We asked our highest scorers how they prepare between contests.',
        content: 'In this recap we spoke with a few of the students at the top of the leaderboard about their routines. The common thread: short, frequent practice sessions on the free sprint quizzes rather than long cramming sessions, plus reading the answer explanation after every question, right or wrong, to close knowledge gaps quickly.',
        category: 'community', type: 'vlog', vlogUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', featured: 0,
      },
      {
        title: 'Vlog: A Walkthrough of the AI Proctoring System Check',
        description: 'What the camera, microphone, and fullscreen checks actually look like before a proctored contest.',
        content: 'Before any proctored contest, students go through a short consent step followed by a live system check: camera preview, microphone level, and a fullscreen prompt. This walkthrough covers what each indicator means and what to do if the camera or microphone check does not pass on the first try.',
        category: 'platform', type: 'vlog', vlogUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', featured: 0,
      },
    ];

    const articleIds = [];
    for (const a of articles) {
      const artRes = await client.query(
        `INSERT INTO news_articles (title, description, content, category, article_type, vlog_url, author_name, is_published, is_featured, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,'DreamNexa Team',1,$7,$8)
         RETURNING id`,
        [a.title, a.description, a.content, a.category, a.type, a.vlogUrl || null, a.featured, adminId]
      );
      articleIds.push({ id: artRes.rows[0].id, title: a.title, description: a.description, category: a.category });
    }

  });

  console.log('✔ Seed complete.');
  console.log('   Admin login:  admin / Admin@12345');
}

/**
 * Seeds baseline data only if the database looks empty (no quizzes yet).
 * Safe to call on every server boot — unlike seed() on its own, this
 * will NOT duplicate quizzes/contests on a second run, because the quiz
 * INSERTs in seed() have no ON CONFLICT guard.
 */
async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM quizzes');
  const count = Number(rows[0]?.count || 0);
  if (count > 0) {
    console.log(`[seed] skipped — ${count} quiz(zes) already present.`);
    return false;
  }
  await seed();
  return true;
}

// CLI entrypoint: `npm run seed`
if (require.main === module) {
  seed()
    .catch((err) => {
      console.error('✖ Seed failed:', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}

module.exports = { seed, seedIfEmpty };
