require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool, withTransaction } = require('./pool');

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

    // Sample quiz: General Knowledge Sprint
    const quizRes = await client.query(
      `INSERT INTO quizzes (title, description, instructions, duration_minutes, negative_marking, passing_marks, is_published)
       VALUES ('General Knowledge Sprint', 'A fast-paced 10-question GK quiz for campus contests.',
               'Answer all questions before the timer runs out. Each wrong answer deducts 0.25 marks.',
               10, 0.25, 4, true)
       RETURNING id`
    );
    const quizId = quizRes.rows[0].id;

    const questions = [
      ['Which planet is known as the Red Planet?', ['A) Earth','B) Mars','C) Jupiter','D) Venus'], ['B']],
      ['Who wrote the Indian National Anthem?', ['A) Bankim Chandra','B) Sarojini Naidu','C) Rabindranath Tagore','D) Subhas Chandra Bose'], ['C']],
      ['What is the capital of Karnataka?', ['A) Mysuru','B) Bengaluru','C) Hubballi','D) Mangaluru'], ['B']],
      ['H2O is the chemical formula for?', ['A) Hydrogen Peroxide','B) Salt','C) Water','D) Oxygen'], ['C']],
      ['The Great Wall is located in which country?', ['A) Japan','B) China','C) India','D) Mongolia'], ['B']],
    ];

    let order = 0;
    for (const [text, opts, correct] of questions) {
      const options = opts.map((o) => ({ id: o[0], text: o.slice(3) }));
      order += 1;
      await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_options, marks, negative_marks, order_index)
         VALUES ($1,$2,'mcq',$3,$4,1,0.25,$5)`,
        [quizId, text, JSON.stringify(options), JSON.stringify(correct), order]
      );
    }

    // Sample contest template — free entry, non-cash reward structure
    await client.query(
      `INSERT INTO contest_templates
        (name, description, quiz_id, entry_points_cost, max_participants, duration_minutes, reward_structure, auto_regenerate, is_active)
       VALUES (
        'Campus GK Sprint',
        'Free 6-player quiz sprint. Fill all seats to start instantly.',
        $1, 0, 6, 10,
        $2,
        true, true
       )`,
      [
        quizId,
        JSON.stringify([
          { rank: 1, badge: 'gold_scholar', points: 200 },
          { rank: 2, badge: 'silver_scholar', points: 120 },
          { rank: 3, badge: 'bronze_scholar', points: 60 },
        ]),
      ]
    );
  });

  console.log('✔ Seed complete. Admin login: admin / Admin@12345');
  await pool.end();
}

seed().catch((err) => {
  console.error('✖ Seed failed:', err);
  process.exit(1);
});
