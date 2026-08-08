const crypto = require("crypto");

const SUITS = ["S", "H", "D", "C"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const RANK_BY_VALUE = new Map(RANKS.map((rank) => [rankValue(rank), rank]));
const MIRROR_RANK = new Map([
  [14, 13],
  [13, 14],
  [12, 2],
  [11, 3],
  [10, 4],
  [9, 5],
  [8, 6],
  [7, 7],
  [6, 8],
  [5, 9],
  [4, 10],
  [3, 11],
  [2, 12]
]);

const HANDS = [
  { id: "high-card", name: "High Card", multiplier: 1 },
  { id: "one-pair", name: "One Pair", multiplier: 2 },
  { id: "two-pair", name: "Two Pair", multiplier: 3 },
  { id: "three-kind", name: "Three of a Kind", multiplier: 4 },
  { id: "straight", name: "Straight", multiplier: 5 },
  { id: "flush", name: "Flush", multiplier: 6 },
  { id: "full-house", name: "Full House", multiplier: 8 },
  { id: "four-kind", name: "Four of a Kind", multiplier: 11 },
  { id: "straight-flush", name: "Straight Flush", multiplier: 15 }
];

const HAND_BY_ID = new Map(HANDS.map((hand) => [hand.id, hand]));
const FATE_DICE_OUTCOMES = [
  { value: 3, probability: 0.025 },
  { value: 4, probability: 0.05 },
  { value: 5, probability: 0.085 },
  { value: 6, probability: 0.2 },
  { value: 7, probability: 0.21 },
  { value: 8, probability: 0.2 },
  { value: 10, probability: 0.13 },
  { value: 12, probability: 0.06 },
  { value: 15, probability: 0.03 },
  { value: 20, probability: 0.01 }
];
const FATE_COLLECTOR_BONUSES = [0, 20, 80, 150, 300, 400];
const FATE_PREDICTION_SUCCESS_BONUSES = [0, 0, 50, 100, 300, 500];
const FATE_STARTING_DISCARD_USES = new Map([
  ["giant", 8],
  ["dice", 6],
  ["big-short", 6],
  ["going-long", 6],
  ["fate-collector", 6],
  ["clod", 6],
  ["hanged-man", 5],
  ["persona", 3],
  ["american-psycho", 5]
]);
const FATE_DICE_EFFECT_KINDS = new Set([
  "shadow-swap",
  "void-erosion",
  "refresher-orb",
  "world-mirror",
  "man-mirror",
  "goelia",
  "shadow-targeting",
  "chaos-dice"
]);
const HANGED_MAN_MULTIPLIER_HANDS = new Set([
  "high-card",
  "one-pair",
  "two-pair",
  "three-kind",
  "straight"
]);
const SCORE_LOSS_FATE_ENDINGS = new Map([
  ["hanged-man", "hanged-man-health"],
  ["persona", "persona-miss"],
  ["american-psycho", "american-psycho-paul-allen"],
  ["clod", "clod-chocolate"],
  ["dice", "dice-probability"],
  ["fate-collector", "collector-loss"],
  ["big-short", "big-short-kurumi"],
  ["going-long", "going-long-kurumi"]
]);
const SCORE_WIN_FATE_ENDINGS = new Map([
  ["giant", "giant-small-step"],
  ["hanged-man", "hanged-man-win-health"],
  ["persona", "persona-own-cards"],
  ["american-psycho", "american-psycho-paul-axe"],
  ["clod", "clod-west-germany"],
  ["dice", "dice-probability-win"],
  ["fate-collector", "collector-palace"],
  ["big-short", "big-short-win-kurumi"],
  ["going-long", "going-long-win-kurumi"]
]);

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ code: `${rank}${suit}`, rank: rankValue(rank), suit });
    }
  }
  return deck;
}

function rankValue(rank) {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  if (rank === "T") return 10;
  return Number(rank);
}

function chipValue(card) {
  return card.rank === 14 ? 15 : card.rank;
}

function fateChipValue(card, fateKind) {
  if (fateKind !== "hanged-man" || card.rank === 14) return chipValue(card);
  return Math.max(0, 14 - card.rank);
}

function shuffle(cards) {
  const copy = cards.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function evaluateExactFive(cards) {
  if (!Array.isArray(cards) || cards.length !== 5) {
    throw new Error("Exactly five cards are required.");
  }

  const rankCounts = new Map();
  for (const card of cards) rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const straight = isStraight(Array.from(rankCounts.keys()));

  let id = "high-card";
  if (straight && flush) id = "straight-flush";
  else if (counts[0] === 4) id = "four-kind";
  else if (counts[0] === 3 && counts[1] === 2) id = "full-house";
  else if (flush) id = "flush";
  else if (straight) id = "straight";
  else if (counts[0] === 3) id = "three-kind";
  else if (counts[0] === 2 && counts[1] === 2) id = "two-pair";
  else if (counts[0] === 2) id = "one-pair";

  return {
    ...HAND_BY_ID.get(id),
    scoringIndexes: scoringIndexesForHand(cards, id, rankCounts)
  };
}

function isStraight(uniqueRanks) {
  if (uniqueRanks.length !== 5) return false;
  const ranks = uniqueRanks.slice().sort((a, b) => a - b);
  if (ranks.join(",") === "2,3,4,5,14") return true;
  return ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);
}

function isRoyalFlush(cards) {
  if (!Array.isArray(cards) || cards.length !== 5) return false;
  if (!cards.every((card) => card.suit === cards[0].suit)) return false;
  return cards.map((card) => card.rank).sort((left, right) => left - right).join(",") === "10,11,12,13,14";
}

function royalFlushWins(cards, winningSuits) {
  if (!isRoyalFlush(cards)) return false;
  const allowed = new Set(Array.isArray(winningSuits) ? winningSuits : []);
  return allowed.has(cards[0].suit);
}

function giantFatePenalty(roundScores) {
  const scores = (Array.isArray(roundScores) ? roundScores : [])
    .map((score) => Math.max(0, Number(score) || 0));
  if (!scores.length) return 0;
  const lowest = Math.min(...scores);
  const highest = Math.max(...scores);
  return Math.max(0, Math.round(Math.max(lowest * 1.3, highest * 0.5)));
}

function giantAoePenalty(giantHandScore) {
  return Math.floor(Math.max(0, Number(giantHandScore) || 0) * 0.3);
}

function giantSmashPenalty(giantHandScore) {
  return Math.floor(Math.max(0, Number(giantHandScore) || 0) * 0.3);
}

function giantLeaderSmashPenalty(giantHandScore) {
  return Math.floor(Math.max(0, Number(giantHandScore) || 0) * 0.6);
}

function giantDefenseReduction(round) {
  const reductions = [0, 0.8, 0.7, 0.6, 0.5, 0.4];
  return reductions[Math.max(0, Math.min(5, Number(round) || 0))] || 0;
}

function giantDefensePenalty(penalty, round) {
  const safePenalty = Math.max(0, Number(penalty) || 0);
  return Math.max(0, Math.round(safePenalty * (1 - giantDefenseReduction(round))));
}

function giantSettlementPlan(seats, giantSeatId, giantHandScore) {
  const opponents = (Array.isArray(seats) ? seats : [])
    .filter((seat) => seat?.seatId && seat.seatId !== giantSeatId);
  const bareHandScore = Math.max(0, Number(giantHandScore) || 0);
  const highestOpponentScore = opponents.length
    ? Math.max(...opponents.map((seat) => Math.max(0, Number(seat.roundScore) || 0)))
    : null;
  return {
    burdenPenalty: giantFatePenalty(opponents.map((seat) => seat.roundScore)),
    aoePenalty: giantAoePenalty(bareHandScore),
    aoeTargetSeatIds: opponents.map((seat) => seat.seatId),
    smashPenalty: giantSmashPenalty(bareHandScore),
    smashTargetSeatIds: opponents
      .filter((seat) => (Number(seat.roundScore) || 0) < bareHandScore)
      .map((seat) => seat.seatId),
    leaderSmashPenalty: giantLeaderSmashPenalty(bareHandScore),
    leaderSmashTargetSeatIds: highestOpponentScore === null
      ? []
      : opponents
        .filter((seat) => Math.max(0, Number(seat.roundScore) || 0) === highestOpponentScore)
        .map((seat) => seat.seatId)
  };
}

function giantKillerActiveInRound(untilRound, round) {
  const limit = Math.max(0, Number(untilRound) || 0);
  const current = Math.max(0, Number(round) || 0);
  return limit > 0 && current > 0 && current <= limit;
}

function fatePredictionCorrect(fateKind, targetScore, roundScores) {
  const target = Number(targetScore);
  const scores = (Array.isArray(roundScores) ? roundScores : [])
    .map((score) => Number(score))
    .filter(Number.isFinite);
  if (!Number.isFinite(target) || !scores.length) return false;
  if (fateKind === "going-long") return target === Math.max(...scores);
  if (fateKind === "big-short") return target === Math.min(...scores);
  return false;
}

function nextFatePredictionSuccessCount(currentCount, correct) {
  const current = Math.max(0, Math.floor(Number(currentCount) || 0));
  return current + (correct ? 1 : 0);
}

function fatePredictionSuccessBonus(successCount) {
  const index = Math.max(0, Math.min(5, Math.floor(Number(successCount) || 0)));
  return FATE_PREDICTION_SUCCESS_BONUSES[index] || 0;
}

function fateStartingDiscardUses(fateKind, defaultUses = 4) {
  const fallback = Math.max(0, Math.floor(Number(defaultUses) || 0));
  return FATE_STARTING_DISCARD_USES.get(String(fateKind || "")) || fallback;
}

function giantHandSize(round) {
  const sizes = [0, 4, 5, 5, 5, 5];
  const normalizedRound = Math.max(1, Math.min(5, Math.floor(Number(round) || 1)));
  return sizes[normalizedRound];
}

function effectAddsFateDie(effectKind) {
  return FATE_DICE_EFFECT_KINDS.has(String(effectKind || ""));
}

function personaBorrowLimit(round) {
  const currentRound = Math.floor(Number(round) || 0);
  return currentRound >= 1 && currentRound <= 5 ? 1 : 0;
}

function americanPsychoNextRoundBonus(higherTotalCount, higherRoundCount) {
  const n = Math.max(0, Math.floor(Number(higherTotalCount) || 0));
  const m = Math.max(0, Math.floor(Number(higherRoundCount) || 0));
  return {
    higherTotalCount: n,
    higherRoundCount: m,
    chips: m * 5,
    multiplier: n <= 3 ? Math.max(1, n) : Math.min(3, n)
  };
}

function americanPsychoSettledRoundScore(roundScore, higherTotalCount, higherRoundCount) {
  const score = Math.max(0, Math.floor(Number(roundScore) || 0));
  const n = Math.max(0, Math.floor(Number(higherTotalCount) || 0));
  const m = Math.max(0, Math.floor(Number(higherRoundCount) || 0));
  return n === 0 && m === 0 ? Math.floor(score * 0.7) : score;
}

function americanPsychoStandingCounts(seats, seatId) {
  const normalized = (Array.isArray(seats) ? seats : [])
    .filter((seat) => seat?.seatId)
    .map((seat) => ({
      seatId: String(seat.seatId),
      totalScore: Math.max(0, Number(seat.totalScore) || 0),
      roundScore: Math.max(0, Number(seat.roundScore) || 0)
    }));
  const subjectId = String(seatId || "");
  const subject = normalized.find((seat) => seat.seatId === subjectId);
  if (!subject) return { higherTotalCount: 0, higherRoundCount: 0 };
  const opponents = normalized.filter((seat) => seat.seatId !== subjectId);
  return {
    higherTotalCount: opponents.filter((seat) => seat.totalScore > subject.totalScore).length,
    higherRoundCount: opponents.filter((seat) => seat.roundScore > subject.roundScore).length
  };
}

function americanPsychoQualifyingTargetSeatIds(seats, seatId) {
  const normalized = (Array.isArray(seats) ? seats : [])
    .filter((seat) => seat?.seatId)
    .map((seat) => ({
      seatId: String(seat.seatId),
      totalScore: Math.max(0, Number(seat.totalScore) || 0),
      roundScore: Math.max(0, Number(seat.roundScore) || 0)
    }));
  const subjectId = String(seatId || "");
  const subject = normalized.find((seat) => seat.seatId === subjectId);
  if (!subject) return [];
  return normalized
    .filter((seat) => (
      seat.seatId !== subjectId
      && seat.totalScore > subject.totalScore
      && seat.roundScore > subject.roundScore
    ))
    .map((seat) => seat.seatId);
}

function americanPsychoAssassinationEligibleSeatIds(
  seats,
  seatId,
  progress = {},
  assassinatedSeatIds = [],
  threshold = 3,
  limit = 2
) {
  const subjectId = String(seatId || "");
  const used = new Set((Array.isArray(assassinatedSeatIds) ? assassinatedSeatIds : []).map(String));
  if (used.size >= Math.max(0, Math.floor(Number(limit) || 0))) return [];
  const requiredRounds = Math.max(1, Math.floor(Number(threshold) || 1));
  return (Array.isArray(seats) ? seats : [])
    .filter((seat) => seat?.seatId)
    .map((seat) => String(seat.seatId))
    .filter((targetSeatId) => (
      targetSeatId !== subjectId
      && !used.has(targetSeatId)
      && Math.max(0, Number(progress?.[targetSeatId]) || 0) >= requiredRounds
    ));
}

function americanPsychoSettlementPlan(seats, seatId) {
  const subjectId = String(seatId || "");
  const normalized = (Array.isArray(seats) ? seats : [])
    .filter((seat) => seat?.seatId)
    .map((seat) => ({
      seatId: String(seat.seatId),
      totalScore: Math.max(0, Number(seat.totalScore) || 0),
      roundScore: Math.max(0, Number(seat.roundScore) || 0)
    }));
  const subject = normalized.find((seat) => seat.seatId === subjectId);
  if (!subject) return null;

  const initialCounts = americanPsychoStandingCounts(normalized, subjectId);
  const settledRoundScore = americanPsychoSettledRoundScore(
    subject.roundScore,
    initialCounts.higherTotalCount,
    initialCounts.higherRoundCount
  );
  const scoreReduction = subject.roundScore - settledRoundScore;
  const settledSeats = normalized.map((seat) => seat.seatId === subjectId
    ? {
      ...seat,
      roundScore: settledRoundScore,
      totalScore: Math.max(0, seat.totalScore - scoreReduction)
    }
    : seat);
  const finalCounts = americanPsychoStandingCounts(settledSeats, subjectId);
  return {
    initialHigherTotalCount: initialCounts.higherTotalCount,
    initialHigherRoundCount: initialCounts.higherRoundCount,
    higherTotalCount: finalCounts.higherTotalCount,
    higherRoundCount: finalCounts.higherRoundCount,
    settledRoundScore,
    scoreReduction,
    nextRoundBonus: americanPsychoNextRoundBonus(
      finalCounts.higherTotalCount,
      finalCounts.higherRoundCount
    )
  };
}

function scoreLossEndingIds(context = {}) {
  const fateKind = String(context.fateKind || "");
  const endings = [];
  if (fateKind === "giant") endings.push("giant-david");
  if (fateKind !== "giant" && Number(context.totalScore) === 0 && context.giantReducedToZero) {
    endings.push("giant-zero-release");
  }
  if (context.assassinationDamageTaken) endings.push("assassinated-by-american-psycho");
  if (context.escapedAssassination) endings.push("escaped-american-psycho");
  if (context.tomatoEffectChosen) endings.push("greenhouse-tomatoes");
  const fateEnding = SCORE_LOSS_FATE_ENDINGS.get(fateKind);
  if (fateEnding) endings.push(fateEnding);
  if (context.royalVictory) endings.push("royal-flush-someone-cheated");
  return endings;
}

function scoreEndingIds(context = {}) {
  if (!context.won) return scoreLossEndingIds({
    ...context,
    royalVictory: context.gameEndedByRoyalFlush ?? context.royalVictory
  });
  const endings = [];
  if (context.escapedAssassination) endings.push("escaped-american-psycho");
  const fateEnding = SCORE_WIN_FATE_ENDINGS.get(String(context.fateKind || ""));
  if (fateEnding) endings.push(fateEnding);
  if (context.tomatoEffectChosen && !context.wonByRoyalFlush) endings.push("tomato-god");
  if (context.wonByRoyalFlush) endings.push("royal-flush-exodia");
  return endings;
}

function fatePredictionPlan(seats, predictors) {
  const scoreBySeatId = new Map(
    (Array.isArray(seats) ? seats : [])
      .filter((seat) => seat?.seatId)
      .map((seat) => [String(seat.seatId), Math.max(0, Number(seat.roundScore) || 0)])
  );
  const validPredictors = (Array.isArray(predictors) ? predictors : [])
    .filter((predictor) => predictor?.seatId && predictor?.targetSeatId && scoreBySeatId.has(String(predictor.targetSeatId)));
  const allScores = Array.from(scoreBySeatId.values());
  const highestScore = allScores.length ? Math.max(...allScores) : null;
  const lowestScore = allScores.length ? Math.min(...allScores) : null;
  const highestSeatIds = new Set(
    Array.from(scoreBySeatId).filter(([, score]) => score === highestScore).map(([seatId]) => seatId)
  );
  const lowestSeatIds = new Set(
    Array.from(scoreBySeatId).filter(([, score]) => score === lowestScore).map(([seatId]) => seatId)
  );
  const outcomes = validPredictors.map((predictor) => {
    const targetSeatId = String(predictor.targetSeatId);
    const fateKind = String(predictor.fateKind || "");
    return {
      seatId: String(predictor.seatId),
      targetSeatId,
      correct: fateKind === "going-long"
        ? highestSeatIds.has(targetSeatId)
        : fateKind === "big-short" && lowestSeatIds.has(targetSeatId)
    };
  });
  return {
    roundScores: Object.fromEntries(scoreBySeatId),
    highestSeatIds: Array.from(highestSeatIds),
    lowestSeatIds: Array.from(lowestSeatIds),
    outcomes
  };
}

function fateCollectorBonus(collectionNumber) {
  return Math.max(0, Number(FATE_COLLECTOR_BONUSES[Math.max(0, Number(collectionNumber) || 0)]) || 0);
}

function scoringIndexesForHand(cards, handId, rankCounts) {
  if (["straight", "flush", "full-house", "straight-flush"].includes(handId)) {
    return cards.map((_, index) => index);
  }
  if (handId === "high-card") {
    let highestIndex = 0;
    for (let index = 1; index < cards.length; index += 1) {
      if (chipValue(cards[index]) > chipValue(cards[highestIndex])) highestIndex = index;
    }
    return [highestIndex];
  }

  const ranksByCount = new Map();
  for (const [rank, count] of rankCounts.entries()) {
    if (!ranksByCount.has(count)) ranksByCount.set(count, []);
    ranksByCount.get(count).push(rank);
  }

  let scoringRanks = [];
  if (handId === "one-pair") scoringRanks = ranksByCount.get(2) || [];
  else if (handId === "two-pair") scoringRanks = ranksByCount.get(2) || [];
  else if (handId === "three-kind") scoringRanks = ranksByCount.get(3) || [];
  else if (handId === "four-kind") scoringRanks = ranksByCount.get(4) || [];

  return cards
    .map((card, index) => (scoringRanks.includes(card.rank) ? index : -1))
    .filter((index) => index >= 0);
}

function createEffectOptions(options = {}) {
  const excludedKinds = new Set(Array.isArray(options.excludedKinds) ? options.excludedKinds : []);
  const effectPool = [
    () => ({ kind: "suit-chip", suit: randomItem(SUITS) }),
    () => ({ kind: "rank-chip" }),
    () => ({ kind: "pair-mult" }),
    () => ({ kind: "flush-mult" }),
    () => ({ kind: "red-chip" }),
    () => ({ kind: "void-suit", suit: randomItem(SUITS), amount: 3 }),
    () => ({ kind: "pattern-reproduction" }),
    () => ({ kind: "shadow-swap" }),
    () => ({ kind: "void-erosion" }),
    () => ({ kind: "world-mirror" }),
    () => ({ kind: "man-mirror" }),
    () => ({ kind: "draven", amount: 0.2 }),
    () => ({ kind: "goelia" }),
    () => ({ kind: "shadow-targeting" }),
    () => ({ kind: "chaos-dice" }),
    () => ({ kind: "rambo", seconds: 20 }),
    () => ({ kind: "tomato-king" }),
    () => ({ kind: "tomato-shooter" }),
    () => ({ kind: "runaans-hurricane" }),
    () => ({ kind: "old-days-tomatoes" }),
    () => ({ kind: "lord-dominicks-regards" }),
    () => ({ kind: "collector" }),
    () => ({ kind: "bite-me" }),
    () => ({ kind: "straight-flush-boost" }),
    () => ({ kind: "change-straight" }),
    () => ({ kind: "protoceratops" }),
    () => ({ kind: "bread-butter" }),
    () => ({ kind: "bread-cheese" }),
    () => ({ kind: "bread-jam" }),
    () => ({ kind: "astral-body" }),
    () => ({ kind: "tempered-tomato" }),
    () => ({ kind: "returning-fundamentals" }),
    () => ({ kind: "draw-sword" }),
    () => ({ kind: "critical-hit" }),
    () => ({ kind: "infinity-edge" }),
    () => ({ kind: "brutal-force" }),
    () => ({ kind: "vigorous" }),
    () => ({ kind: "refresher-orb" }),
    () => ({ kind: "giant-killer" }),
    () => ({ kind: "matthew-effect" }),
    () => ({ kind: "critical-switch-hand" }),
    () => ({ kind: "dance-illusions" })
  ];

  const selected = [];
  for (const factory of shuffle(effectPool)) {
    const effect = factory();
    if (excludedKinds.has(effect.kind)) continue;
    if (!effectAllowedInRound(effect.kind, options.round)) continue;
    const key = `${effect.kind}:${effect.suit || effect.rank || ""}`;
    if (selected.some((entry) => `${entry.kind}:${entry.suit || entry.rank || ""}` === key)) continue;
    selected.push({ ...effect, id: crypto.randomBytes(6).toString("hex") });
    if (selected.length === 3) break;
  }
  return selected;
}

function effectAllowedInRound(kind, round) {
  if (round === undefined || round === null) return true;
  const numericRound = Number(round) || 0;
  if (["returning-fundamentals", "draw-sword"].includes(kind)) {
    return numericRound >= 2 && numericRound <= 3;
  }
  if (kind === "old-days-tomatoes") return numericRound === 5;
  if (kind === "astral-body") return numericRound < 5;
  return true;
}

function scorePlay(cards, effect, context = {}) {
  const hand = evaluateExactFive(cards);
  const royalFlush = isRoyalFlush(cards);
  const naturalBaseMultiplier = hand.multiplier;
  const fateKind = String(context.fateKind || "");
  const baseMultiplier = fateKind === "hanged-man" && HANGED_MAN_MULTIPLIER_HANDS.has(hand.id)
    ? 6
    : naturalBaseMultiplier;
  const requestedFateDiceMultiplier = Number(context.fateDiceMultiplier);
  const fateDiceMultiplier = Number.isFinite(requestedFateDiceMultiplier) && requestedFateDiceMultiplier > 0
    ? requestedFateDiceMultiplier
    : null;
  const tomatoFinalScoreMultiplier = Math.min(hand.multiplier, 2);
  const temperedTomatoFinalScoreMultiplier = Math.min(hand.multiplier, 1);
  const scoringIndexes = new Set(hand.scoringIndexes || cards.map((_, index) => index));
  let chips = 0;
  let additiveMultiplier = 0;
  let chipFactor = 1;
  const cardValues = [];
  const multiplierBonuses = [];
  const multiplierFactors = [];
  const globalChipBonuses = [];
  const chipFactors = [];
  const scoreBonuses = [];
  const scoreFactors = [];
  const roundEffects = Array.isArray(context.roundEffects) ? context.roundEffects : [];
  const persistentEffects = context.persistentEffects || {};
  const tomatoCounts = context.tomatoCounts || {};
  const round = Number(context.round) || 0;
  const scoredSeatId = context.seatId ? String(context.seatId) : "";
  const criticalRolls = Array.isArray(context.criticalRolls) ? context.criticalRolls : [];
  const useCriticalExpectedValue = Boolean(context.criticalExpected);
  const criticalProfile = criticalProfileForEffects(persistentEffects);
  let voidOwnerSuitApplied = false;
  let flatScoreBonus = 0;
  let scoreFactor = 1;
  let finalScoreFactor = 1;
  let kickerChipsUsed = 0;
  let criticalTriggered = false;
  const finalScoreFactors = [];

  function addMultiplierBonus(kind, amount) {
    if (!amount) return;
    additiveMultiplier += amount;
    multiplierBonuses.push({ kind, amount });
  }

  function addMultiplierFactor(kind, factor) {
    if (!factor || factor === 1) return;
    multiplierFactors.push({ kind, factor });
  }

  function addGlobalChipBonus(kind, amount) {
    if (!amount) return;
    chips += amount;
    globalChipBonuses.push({ kind, amount });
  }

  function addChipFactor(kind, factor) {
    if (!factor || factor === 1) return;
    chipFactor *= factor;
    chipFactors.push({ kind, factor });
  }

  function addScoreBonus(kind, amount) {
    if (!amount) return;
    flatScoreBonus += amount;
    scoreBonuses.push({ kind, amount });
  }

  function addScoreFactor(kind, factor) {
    if (!factor || factor === 1) return;
    scoreFactor *= factor;
    scoreFactors.push({ kind, factor });
  }

  function addFinalScoreFactor(kind, factor) {
    if (!factor || factor === 1) return;
    finalScoreFactor *= factor;
    finalScoreFactors.push({ kind, factor });
  }

  for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
    const card = cards[cardIndex];
    const scoresHand = scoringIndexes.has(cardIndex);
    const originalPrintedChips = fateChipValue(card, fateKind);
    const personaWeakened = Boolean(card.personaWeakened);
    const printedChips = personaWeakened ? originalPrintedChips * 0.5 : originalPrintedChips;
    const kickerChips = scoresHand ? 0 : Math.min(Math.max(0, 20 - kickerChipsUsed), Math.floor(printedChips * 0.4));
    if (!scoresHand) kickerChipsUsed += kickerChips;
    const baseChips = scoresHand ? printedChips : kickerChips;
    let finalChips = baseChips;
    const bonuses = [];
    if (personaWeakened) {
      bonuses.push({
        kind: "persona-card-penalty",
        amount: printedChips - originalPrintedChips,
        factor: 0.5
      });
    }
    if (effect?.kind === "red-chip") {
      const amount = card.suit === "H" || card.suit === "D" ? 7 : 5;
      finalChips += amount;
      bonuses.push({ kind: effect.kind, amount });
    }
    for (const roundEffect of roundEffects) {
      if (roundEffect.kind === "void-suit" && card.suit === roundEffect.suit) {
        const isVoidOwner = effect?.kind === "void-suit"
          && effect.suit === roundEffect.suit
          && (!roundEffect.sourceSeatId || String(roundEffect.sourceSeatId) === scoredSeatId);
        if (isVoidOwner) {
          finalChips += 12;
          bonuses.push({ kind: roundEffect.kind, suit: roundEffect.suit, amount: 12 });
          voidOwnerSuitApplied = true;
        } else {
          const reduced = Math.max(0, finalChips - roundEffect.amount);
          bonuses.push({ kind: roundEffect.kind, suit: roundEffect.suit, amount: reduced - finalChips });
          finalChips = reduced;
        }
      }
    }
    if ((scoresHand || kickerChips > 0) && criticalProfile.chance > 0) {
      const criticalMultiplier = criticalMultiplierForCard(cardIndex, criticalProfile, criticalRolls, useCriticalExpectedValue);
      if (criticalMultiplier > 1) {
        const beforeCritical = finalChips;
        finalChips *= criticalMultiplier;
        if (criticalRolls[cardIndex] === true) criticalTriggered = true;
        bonuses.push({
          kind: "critical-hit",
          amount: finalChips - beforeCritical,
          multiplier: criticalMultiplier,
          critical: criticalRolls[cardIndex] === true,
          expected: criticalRolls[cardIndex] !== true,
          chance: criticalProfile.chance
        });
      }
    }
    chips += finalChips;
    cardValues.push({
      code: card.code,
      displayCode: displayCode(card),
      scoresHand,
      printedChips,
      baseChips,
      kickerChips,
      bonuses,
      finalChips
    });
  }

  if (effect?.kind === "suit-chip") {
    const matches = cards.filter((card) => card.suit === effect.suit).length;
    addGlobalChipBonus(effect.kind, Math.min(40, Math.max(20, matches * 8)));
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "rank-chip") {
    const matches = cards.filter((card) => rankSymbol(card) === effect.rank).length;
    addGlobalChipBonus(effect.kind, Math.min(50, Math.max(20, matches * 10)));
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "pair-mult") {
    const pairCount = countPairRanks(cards);
    addGlobalChipBonus(effect.kind, Math.max(12, pairCount * 12));
    if (["one-pair", "two-pair"].includes(hand.id)) addMultiplierBonus(effect.kind, 2.5);
  }
  if (effect?.kind === "flush-mult") {
    addGlobalChipBonus(effect.kind, 7);
    if (["flush", "straight-flush"].includes(hand.id)) addMultiplierBonus(effect.kind, 1.5);
  }
  if (effect?.kind === "red-chip") {
    addMultiplierBonus(effect.kind, 2);
  }
  if (voidOwnerSuitApplied) {
    addMultiplierBonus("void-suit", 2);
  }
  if (effect?.kind === "pattern-reproduction") {
    addMultiplierBonus(effect.kind, 2.5);
  }
  if (effect?.kind === "change-straight" && hand.id === "straight") {
    addMultiplierBonus(effect.kind, HAND_BY_ID.get("straight-flush").multiplier - baseMultiplier);
  }
  if (effect?.kind === "straight-flush-boost" && hand.id === "straight-flush") {
    addScoreBonus(effect.kind, 1000);
  }
  if (effect?.kind === "shadow-swap") {
    const difference = Math.max(0, Number(effect.swappedChipDifference) || 0);
    addGlobalChipBonus(effect.kind, Math.max(7, difference));
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "void-erosion") {
    const followingUnplayedPlayers = Math.max(0, Number(effect.followingUnplayedPlayers) || 0);
    addGlobalChipBonus(effect.kind, 5);
    addMultiplierBonus(effect.kind, 1);
    addMultiplierBonus(effect.kind, Math.max(1, followingUnplayedPlayers));
    addScoreBonus(effect.kind, followingUnplayedPlayers * 30);
  }
  if (["world-mirror", "man-mirror"].includes(effect?.kind)) {
    addGlobalChipBonus(effect.kind, Math.max(10, Number(effect.mirrorChipDifference) || 0));
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "goelia") {
    addGlobalChipBonus(effect.kind, Math.max(0, Number(effect.rankDifferenceTotal) || 0));
  }
  if (effect?.kind === "shadow-targeting") {
    addScoreBonus(effect.kind, Math.max(0, Number(effect.gainedChipBonus) || 0) * 10);
    addMultiplierBonus(effect.kind, 2);
  }
  if (effect?.kind === "chaos-dice") {
    const rerolledCardCount = Math.max(0, Number(effect.rerolledCardCount) || 0);
    addGlobalChipBonus(effect.kind, 10 + rerolledCardCount * 0.5);
    addMultiplierBonus(effect.kind, 1);
    addScoreBonus(effect.kind, rerolledCardCount * 10);
  }
  if (effect?.kind === "draven") {
    addMultiplierBonus(effect.kind, 3.5);
  }
  if (effect?.kind === "rambo") {
    const elapsedMs = Math.max(0, Number(context.turnElapsedMs) || 0);
    if (elapsedMs <= 10000) {
      addGlobalChipBonus(effect.kind, 60);
      addMultiplierBonus(effect.kind, 4);
    } else if (elapsedMs <= 20000) {
      addGlobalChipBonus(effect.kind, 30);
      addMultiplierBonus(effect.kind, 2);
    }
  }
  if (effect?.kind === "tomato-king") {
    addScoreBonus(effect.kind, Math.max(0, Number(effect.tomatoHits) || 0) * tomatoFinalScoreMultiplier);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "tomato-shooter") {
    addScoreBonus(effect.kind, Math.max(0, Number(effect.tomatoThrows) || 0) * tomatoFinalScoreMultiplier);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "old-days-tomatoes") {
    const throws = Math.max(0, Number(effect.tomatoThrows) || 0);
    const hits = Math.max(0, Number(effect.tomatoHits) || 0);
    addGlobalChipBonus(effect.kind, throws + hits);
  }
  if (effect?.kind === "dance-illusions") {
    addGlobalChipBonus(effect.kind, 5);
    addMultiplierBonus(effect.kind, 1.5);
  }
  if (effect?.kind === "collector") {
    addGlobalChipBonus(effect.kind, 10);
  }
  if (effect?.kind === "bite-me") {
    addMultiplierBonus(effect.kind, Math.max(0, Number(effect.discardMultiplier) || 0));
  }
  if (effect?.kind === "protoceratops") {
    addMultiplierBonus(effect.kind, 3);
  }
  if (effect?.kind === "brutal-force") {
    addGlobalChipBonus(effect.kind, 25);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "vigorous") {
    // The final-score bonus is added after the hand's normal score is known below.
  }
  if (effect?.kind === "refresher-orb") {
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "matthew-effect") {
    addMultiplierBonus(effect.kind, 2);
  }
  if (effect?.kind === "astral-body") {
    addScoreBonus(effect.kind, 1000);
  }
  if (persistentEffects.breadButter) {
    addGlobalChipBonus("bread-butter", 4);
    if (["one-pair", "two-pair"].includes(hand.id)) {
      addGlobalChipBonus("bread-butter", 5);
      addMultiplierBonus("bread-butter", 2);
    }
  }
  if (persistentEffects.breadCheese) {
    addGlobalChipBonus("bread-cheese", 5);
    if (["three-kind", "full-house", "four-kind"].includes(hand.id)) {
      addGlobalChipBonus("bread-cheese", 7);
      addMultiplierBonus("bread-cheese", 1);
    }
  }
  if (persistentEffects.breadJam) {
    addGlobalChipBonus("bread-jam", 4);
    if (hand.id === "straight") {
      addGlobalChipBonus("bread-jam", 5);
      addMultiplierBonus("bread-jam", 2);
    }
  }
  if (persistentEffects.temperedTomato) {
    const hits = Math.max(0, Number(tomatoCounts.hitsTotal) || 0);
    const throws = Math.max(0, Number(tomatoCounts.throwsTotal) || 0);
    if (hits > 30 || throws > 50) {
      addScoreBonus("tempered-tomato", (hits * 0.5 + throws * 0.2) * temperedTomatoFinalScoreMultiplier);
    }
  }
  if (persistentEffects.returningFundamentals) {
    const bonuses = roundScaling(round, [0, 0, 18, 18, 18, 18], [0, 0, 1.5, 1.5, 1.5, 1.75]);
    addGlobalChipBonus("returning-fundamentals", bonuses.chips);
    addMultiplierBonus("returning-fundamentals", bonuses.multiplier);
  }
  if (persistentEffects.drawSword) {
    const bonuses = roundScaling(round, [0, 0, 15, 15, 15, 15], [0, 0, 2.25, 2.25, 2.25, 2.25]);
    addGlobalChipBonus("draw-sword", bonuses.chips);
    addMultiplierBonus("draw-sword", bonuses.multiplier);
  }
  if (persistentEffects.lordDominicksRegards && ["high-card", "one-pair", "two-pair", "three-kind", "straight"].includes(hand.id)) {
    addMultiplierBonus("lord-dominicks-regards", Math.max(0, 6 - baseMultiplier));
  }
  if (persistentEffects.astralBody) {
    addFinalScoreFactor("astral-body-penalty", astralBodyScoreFactor(round));
  }
  if (persistentEffects.giantKiller) {
    addScoreFactor("giant-killer", giantKillerScoreFactor(context));
  }
  if (fateKind === "giant") {
    addMultiplierBonus("fate-giant", 1);
  }
  if (context.americanPsychoBonus) {
    addGlobalChipBonus("american-psycho", Math.max(0, Number(context.americanPsychoBonus.chips) || 0));
    addMultiplierBonus("american-psycho", Math.max(0, Number(context.americanPsychoBonus.multiplier) || 0));
  }

  const chipTotalBeforeFactors = chips;
  if (chipFactor !== 1) {
    chips = Math.round(chips * chipFactor * 100) / 100;
  }

  const additiveMultiplierTotal = baseMultiplier + additiveMultiplier;
  let multiplierBeforeFateDice = additiveMultiplierTotal;
  for (const entry of multiplierFactors) multiplierBeforeFateDice *= entry.factor;
  let multiplier = fateDiceMultiplier
    ? Math.max(
      fateDiceMultiplier + additiveMultiplier,
      baseMultiplier + additiveMultiplier
    )
    : additiveMultiplierTotal;
  for (const entry of multiplierFactors) multiplier *= entry.factor;
  const scoreBeforeBonuses = chips * multiplier * scoreFactor;
  if (effect?.kind === "vigorous") {
    addScoreBonus(effect.kind, Math.min(200, 100 + scoreBeforeBonuses * 0.25));
  }
  const critEligibleCardCount = cardValues.filter((entry) => entry.scoresHand || entry.kickerChips > 0).length;
  if (criticalProfile.chance > 0) {
    if (useCriticalExpectedValue) {
      addScoreBonus("no-critical-hit", 100 * Math.pow(1 - criticalProfile.chance, critEligibleCardCount));
    } else if (!criticalTriggered) {
      addScoreBonus("no-critical-hit", 100);
    }
  }
  const weaknessFactor = context.weaknessActive ? 0.75 : 1;
  if (weaknessFactor !== 1) finalScoreFactors.push({ kind: "weakness", factor: weaknessFactor });
  const rawScore = (scoreBeforeBonuses * finalScoreFactor + flatScoreBonus) * weaknessFactor;
  const score = Math.min(1000000, Math.max(0, Math.floor(rawScore)));

  return {
    handId: hand.id,
    handName: hand.name,
    isRoyalFlush: royalFlush,
    chips,
    baseMultiplier,
    naturalBaseMultiplier,
    bonusMultiplier: additiveMultiplier,
    additiveMultiplierTotal,
    multiplierFactors,
    multiplierBeforeFateDice,
    fateDiceMultiplier,
    multiplier,
    score,
    chipTotalBeforeFactors,
    chipFactors,
    cardValues,
    globalChipBonuses,
    multiplierBonuses,
    scoreBonuses,
    scoreFactors,
    finalScoreFactors,
    criticalTriggered,
    kickerChips: kickerChipsUsed
  };
}

function countPairRanks(cards) {
  const counts = new Map();
  for (const card of cards) counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  return Array.from(counts.values()).filter((count) => count === 2).length;
}

function astralBodyScoreFactor(round) {
  const numericRound = Number(round) || 0;
  if (numericRound >= 5) return 1;
  if (numericRound <= 2) return 0.7;
  if (numericRound === 3) return 0.6;
  return 0.5;
}

function roundScaling(round, chipValues, multiplierValues) {
  const index = Math.max(0, Math.min(chipValues.length - 1, Number(round) || 0));
  return {
    chips: Number(chipValues[index]) || 0,
    multiplier: Number(multiplierValues[index]) || 0
  };
}

function criticalProfileForEffects(persistentEffects = {}) {
  let chance = 0;
  let multiplier = 1.75;
  if (persistentEffects.criticalHit) chance += 0.5;
  if (persistentEffects.infinityEdge) {
    chance += 0.25;
    multiplier = Math.max(multiplier, 2.25);
  }
  if (persistentEffects.criticalSwitchHand) chance += 0.25;
  if (persistentEffects.danceIllusions) chance += 0.25;
  if (persistentEffects.runaansHurricane) chance += 0.25;
  if (persistentEffects.lordDominicksRegards) chance += 0.25;
  if (persistentEffects.collector) chance += 0.25;
  return {
    chance: Math.min(1, Math.max(0, chance)),
    multiplier
  };
}

function tomatoCountRouting(throwerHasDanceIllusions, targetHasDanceIllusions) {
  return {
    countsForThrower: Boolean(throwerHasDanceIllusions) || !targetHasDanceIllusions,
    countsForTarget: !throwerHasDanceIllusions
  };
}

function tomatoThrowAllowed(phase, currentTurnSeatId, throwerSeatId) {
  return phase === "play-select" && Boolean(currentTurnSeatId) && String(currentTurnSeatId) !== String(throwerSeatId);
}

function fateDiceValueForRoll(rawRoll) {
  const roll = Math.min(1 - Number.EPSILON, Math.max(0, Number(rawRoll) || 0));
  let boundary = 0;
  for (const outcome of FATE_DICE_OUTCOMES) {
    boundary = Math.round((boundary + outcome.probability) * 1000000000000) / 1000000000000;
    if (roll < boundary) return outcome.value;
  }
  return FATE_DICE_OUTCOMES[FATE_DICE_OUTCOMES.length - 1].value;
}

function fateDiceMisfortuneExtraRolls(roll) {
  return Number(roll) === 3 ? 1 : 0;
}

function criticalMultiplierForCard(index, profile, criticalRolls, useExpectedValue) {
  if (profile.chance <= 0) return 1;
  if (criticalRolls[index] === true) return profile.multiplier;
  if (criticalRolls[index] === false) return 1;
  return useExpectedValue ? 1 + profile.chance * (profile.multiplier - 1) : 1;
}

function giantKillerScoreFactor(context = {}) {
  const leaderTotal = Math.max(0, Number(context.highestTotalScoreBeforeRound) || 0);
  const seatTotal = Math.max(0, Number(context.totalScoreBeforeRound) || 0);
  const gap = leaderTotal - seatTotal;
  if (gap <= 0) return 1;
  if (gap <= 100) return 1.3;
  if (gap <= 200) return 1.45;
  if (gap <= 300) return 1.6;
  if (gap <= 400) return 1.75;
  return 1.9;
}

function findBestPlay(handCards, communityCards, effect, options = {}) {
  const cards = handCards.concat(communityCards);
  if (cards.length < 5) throw new Error("Not enough cards to find a play.");
  const communitySet = new Set(communityCards);
  let best = null;
  forEachCombination(cards, 5, (selection) => {
    if (options.requireCommunity && !selection.some((card) => communitySet.has(card))) return;
    if (typeof options.validateSelection === "function" && !options.validateSelection(selection)) return;
    const result = scorePlay(selection, effect, options);
    if (!best || result.score > best.result.score || (result.score === best.result.score && result.chips > best.result.chips)) {
      best = { cards: selection, result };
    }
  });
  if (!best) throw new Error("No valid play can be made.");
  return best;
}

function forEachCombination(items, size, callback, start = 0, current = []) {
  if (current.length === size) {
    callback(current.slice());
    return;
  }
  for (let index = start; index <= items.length - (size - current.length); index += 1) {
    current.push(items[index]);
    forEachCombination(items, size, callback, index + 1, current);
    current.pop();
  }
}

function rankSymbol(card) {
  return RANK_BY_VALUE.get(card.rank) || card.code.slice(0, -1);
}

function displayCode(card) {
  return `${rankSymbol(card)}${card.suit}`;
}

function mirrorRankValue(rank) {
  return MIRROR_RANK.get(rank) || rank;
}

function mirrorRankDifference(rank) {
  const originalRank = Number(rank) || 0;
  const mirroredRank = mirrorRankValue(originalRank);
  const differenceValue = (value) => value === 14 ? 1 : value;
  return Math.abs(differenceValue(originalRank) - differenceValue(mirroredRank));
}

function randomItem(items) {
  return items[crypto.randomInt(items.length)];
}

module.exports = {
  FATE_DICE_OUTCOMES,
  HANDS,
  RANKS,
  SUITS,
  americanPsychoAssassinationEligibleSeatIds,
  americanPsychoNextRoundBonus,
  americanPsychoQualifyingTargetSeatIds,
  americanPsychoSettlementPlan,
  americanPsychoStandingCounts,
  americanPsychoSettledRoundScore,
  createDeck,
  createEffectOptions,
  effectAddsFateDie,
  effectAllowedInRound,
  fateCollectorBonus,
  fateDiceMisfortuneExtraRolls,
  fateDiceValueForRoll,
  fatePredictionCorrect,
  fatePredictionPlan,
  fatePredictionSuccessBonus,
  fateStartingDiscardUses,
  fateChipValue,
  nextFatePredictionSuccessCount,
  giantAoePenalty,
  giantDefensePenalty,
  giantDefenseReduction,
  giantFatePenalty,
  giantHandSize,
  giantKillerActiveInRound,
  giantKillerScoreFactor,
  giantLeaderSmashPenalty,
  giantSettlementPlan,
  giantSmashPenalty,
  criticalProfileForEffects,
  displayCode,
  findBestPlay,
  mirrorRankDifference,
  mirrorRankValue,
  personaBorrowLimit,
  rankValue,
  rankSymbol,
  royalFlushWins,
  scoreEndingIds,
  scoreLossEndingIds,
  scorePlay,
  shuffle,
  tomatoCountRouting,
  tomatoThrowAllowed
};
