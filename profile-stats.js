"use strict";

const SCORE_BATTLE_STATS_VERSION = 1;

function nonnegativeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function normalizeFateCounts(value) {
  const counts = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return counts;
  for (const [kind, count] of Object.entries(value)) {
    const cleanKind = String(kind || "").trim();
    const cleanCount = nonnegativeInteger(count);
    if (cleanKind && cleanCount > 0) counts[cleanKind] = cleanCount;
  }
  return counts;
}

function summarizeScoreBattleHistory(history) {
  const summary = { games: 0, wins: 0, fateCounts: {} };
  for (const entry of Array.isArray(history) ? history : []) {
    if (entry?.type !== "score-battle") continue;
    summary.games += 1;
    if (Number(entry.rank) === 1) summary.wins += 1;
    const fateKind = String(entry.fateKind || "").trim();
    if (fateKind) summary.fateCounts[fateKind] = (summary.fateCounts[fateKind] || 0) + 1;
  }
  return summary;
}

function ensureScoreBattleStats(stats, history) {
  const target = stats && typeof stats === "object" ? stats : {};
  const existingVersion = nonnegativeInteger(target.scoreBattleStatsVersion);
  const fateCounts = normalizeFateCounts(target.scoreBattleFateCounts);

  if (existingVersion < SCORE_BATTLE_STATS_VERSION) {
    const historySummary = summarizeScoreBattleHistory(history);
    target.scoreBattleGames = Math.max(nonnegativeInteger(target.scoreBattleGames), historySummary.games);
    target.scoreBattleWins = Math.max(nonnegativeInteger(target.scoreBattleWins), historySummary.wins);
    for (const [kind, count] of Object.entries(historySummary.fateCounts)) {
      fateCounts[kind] = Math.max(fateCounts[kind] || 0, count);
    }
  } else {
    target.scoreBattleGames = nonnegativeInteger(target.scoreBattleGames);
    target.scoreBattleWins = nonnegativeInteger(target.scoreBattleWins);
  }

  target.scoreBattleWins = Math.min(target.scoreBattleWins, target.scoreBattleGames);
  target.scoreBattleFateCounts = fateCounts;
  target.scoreBattleStatsVersion = SCORE_BATTLE_STATS_VERSION;
  return target;
}

function scoreBattleWinRate(games, wins) {
  const gameCount = nonnegativeInteger(games);
  if (!gameCount) return 0;
  return Math.round((Math.min(nonnegativeInteger(wins), gameCount) / gameCount) * 1000) / 10;
}

function favoriteFateKind(fateCounts, orderedKinds = []) {
  const counts = normalizeFateCounts(fateCounts);
  const order = new Map(orderedKinds.map((kind, index) => [kind, index]));
  const entries = Object.entries(counts);
  if (!entries.length) return "";
  entries.sort((left, right) => {
    const countDifference = right[1] - left[1];
    if (countDifference) return countDifference;
    const leftOrder = order.has(left[0]) ? order.get(left[0]) : Number.MAX_SAFE_INTEGER;
    const rightOrder = order.has(right[0]) ? order.get(right[0]) : Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || left[0].localeCompare(right[0]);
  });
  return entries[0][0];
}

module.exports = {
  SCORE_BATTLE_STATS_VERSION,
  ensureScoreBattleStats,
  favoriteFateKind,
  normalizeFateCounts,
  scoreBattleWinRate,
  summarizeScoreBattleHistory
};
