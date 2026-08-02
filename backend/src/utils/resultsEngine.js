/**
 * Results Engine
 * ---------------------------------------------------------------------
 * Evaluates submitted quiz attempts for a contest, ranks participants,
 * and automatically distributes REWARDS defined on the contest's
 * reward_structure (JSON like [{rank:1, badge:'gold_scholar', points:200}]).
 *
 * Rewards are always points (in-app, non-cash) and/or badges — never a
 * cash payout. If an admin wants to fulfill a physical/sponsor prize
 * (e.g. a voucher) for a top rank, that happens manually outside this
 * app; this engine only ever credits the points ledger and badge table.
 * ---------------------------------------------------------------------
 */

async function evaluateContest(client, contestId) {
  const contest = (await client.query(`SELECT * FROM contests WHERE id = $1 FOR UPDATE`, [contestId])).rows[0];
  if (!contest) throw new Error('Contest not found');
  if (contest.status === 'completed') return contest;

  // Rank participants by score desc, then time taken asc (faster wins ties)
  const participants = await client.query(
    `SELECT cp.id, cp.user_id, cp.score, cp.time_taken_seconds
     FROM contest_participants cp
     WHERE cp.contest_id = $1
     ORDER BY cp.score DESC NULLS LAST, cp.time_taken_seconds ASC NULLS LAST`,
    [contestId]
  );

  const rewardStructure = contest.reward_structure || [];
  const rewardByRank = new Map(rewardStructure.map((r) => [r.rank, r]));

  let rank = 0;
  for (const p of participants.rows) {
    rank += 1;
    await client.query(`UPDATE contest_participants SET rank = $1 WHERE id = $2`, [rank, p.id]);

    const reward = rewardByRank.get(rank);
    if (reward) {
      if (reward.points > 0) {
        const pointsService = require('./pointsService');
        await pointsService.credit(client, {
          userId: p.user_id,
          amount: reward.points,
          type: 'rank_bonus',
          referenceId: contestId,
          description: `Rank #${rank} reward in ${contest.name}`,
        });
        await client.query(
          `UPDATE contest_participants SET points_awarded = $1 WHERE id = $2`,
          [reward.points, p.id]
        );
      }
      if (reward.badge) {
        const badgeRow = (await client.query(`SELECT id, name FROM badges WHERE code = $1`, [reward.badge])).rows[0];
        if (badgeRow) {
          await client.query(
            `INSERT INTO user_badges (user_id, badge_id, contest_id)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [p.user_id, badgeRow.id, contestId]
          );
          await client.query(
            `UPDATE contest_participants SET badge_awarded = $1 WHERE id = $2`,
            [badgeRow.name, p.id]
          );
        }
      }
      if (rank === 1) {
        await client.query(
          `UPDATE profiles SET contests_won = contests_won + 1 WHERE user_id = $1`,
          [p.user_id]
        );
      }
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'contest_result', 'Contest results are in!', $2)`,
        [p.user_id, `You ranked #${rank} in ${contest.name}. Check your rewards!`]
      );
    } else {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'contest_result', 'Contest results are in!', $2)`,
        [p.user_id, `You ranked #${rank} in ${contest.name}. Better luck next time!`]
      );
    }
    await client.query(
      `UPDATE profiles SET total_quizzes_played = total_quizzes_played + 1 WHERE user_id = $1`,
      [p.user_id]
    );
  }

  const updated = await client.query(
    `UPDATE contests SET status = 'completed', completed_at = now() WHERE id = $1 RETURNING *`,
    [contestId]
  );
  return updated.rows[0];
}

module.exports = { evaluateContest };
