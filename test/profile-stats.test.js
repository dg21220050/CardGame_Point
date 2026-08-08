const test = require("node:test");
const assert = require("node:assert/strict");

const profileStats = require("../profile-stats");

test("backfills score battle games and wins from existing history once", () => {
  const stats = {};
  const history = [
    { type: "score-battle", rank: 1 },
    { type: "score-battle", rank: 3 },
    { type: "holdem", rank: 1 }
  ];

  profileStats.ensureScoreBattleStats(stats, history);
  assert.equal(stats.scoreBattleGames, 2);
  assert.equal(stats.scoreBattleWins, 1);

  history.push({ type: "score-battle", rank: 1 });
  profileStats.ensureScoreBattleStats(stats, history);
  assert.equal(stats.scoreBattleGames, 2);
  assert.equal(stats.scoreBattleWins, 1);
});

test("backfills FATE counts only when historical records contain FATE data", () => {
  const stats = {};
  profileStats.ensureScoreBattleStats(stats, [
    { type: "score-battle", rank: 1, fateKind: "dice" },
    { type: "score-battle", rank: 2, fateKind: "dice" },
    { type: "score-battle", rank: 3, fateKind: "giant" }
  ]);

  assert.deepEqual(stats.scoreBattleFateCounts, { dice: 2, giant: 1 });
  assert.equal(profileStats.favoriteFateKind(stats.scoreBattleFateCounts, ["giant", "dice"]), "dice");
});

test("uses FATE order to resolve equal favorite counts", () => {
  assert.equal(profileStats.favoriteFateKind({ persona: 2, dice: 2 }, ["dice", "persona"]), "dice");
});

test("formats win rate to one decimal place", () => {
  assert.equal(profileStats.scoreBattleWinRate(3, 1), 33.3);
  assert.equal(profileStats.scoreBattleWinRate(0, 0), 0);
});
