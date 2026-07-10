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
    () => ({ kind: "suit-chip", suit: randomItem(SUITS), amount: 4 }),
    () => ({ kind: "rank-chip", rank: randomItem(RANKS), amount: 7 }),
    () => ({ kind: "pair-mult", amount: 2 }),
    () => ({ kind: "flush-mult", amount: 1.5 }),
    () => ({ kind: "red-chip", amount: 3 }),
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
    () => ({ kind: "rambo", amount: 10, seconds: 15 }),
    () => ({ kind: "tomato-king" }),
    () => ({ kind: "tomato-shooter" }),
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
  return true;
}

function scorePlay(cards, effect, context = {}) {
  const hand = evaluateExactFive(cards);
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

  for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
    const card = cards[cardIndex];
    const scoresHand = scoringIndexes.has(cardIndex);
    const printedChips = chipValue(card);
    const baseChips = scoresHand ? printedChips : 0;
    let finalChips = baseChips;
    const bonuses = [];
    if (effect?.kind === "suit-chip" && card.suit === effect.suit) {
      finalChips += effect.amount;
      bonuses.push({ kind: effect.kind, amount: effect.amount });
    }
    if (effect?.kind === "rank-chip" && rankSymbol(card) === effect.rank) {
      finalChips += effect.amount;
      bonuses.push({ kind: effect.kind, amount: effect.amount });
    }
    if (effect?.kind === "red-chip" && (card.suit === "H" || card.suit === "D")) {
      finalChips += effect.amount;
      bonuses.push({ kind: effect.kind, amount: effect.amount });
    }
    for (const roundEffect of roundEffects) {
      if (roundEffect.kind === "void-suit" && card.suit === roundEffect.suit) {
        const isVoidOwner = effect?.kind === "void-suit"
          && effect.suit === roundEffect.suit
          && (!roundEffect.sourceSeatId || String(roundEffect.sourceSeatId) === scoredSeatId);
        if (isVoidOwner) {
          finalChips += 4;
          bonuses.push({ kind: roundEffect.kind, suit: roundEffect.suit, amount: 4 });
          voidOwnerSuitApplied = true;
        } else {
          const reduced = Math.max(0, finalChips - roundEffect.amount);
          bonuses.push({ kind: roundEffect.kind, suit: roundEffect.suit, amount: reduced - finalChips });
          finalChips = reduced;
        }
      }
    }
    if (scoresHand && criticalProfile.chance > 0) {
      const criticalMultiplier = criticalMultiplierForCard(cardIndex, criticalProfile, criticalRolls, useCriticalExpectedValue);
      if (criticalMultiplier > 1) {
        const beforeCritical = finalChips;
        finalChips *= criticalMultiplier;
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
      bonuses,
      finalChips
    });
  }

  if (effect?.kind === "pair-mult" && ["one-pair", "two-pair"].includes(hand.id)) {
    addMultiplierBonus(effect.kind, effect.amount);
  }
  if (effect?.kind === "flush-mult" && ["flush", "straight-flush"].includes(hand.id)) {
    addMultiplierBonus(effect.kind, effect.amount);
  }
  if (voidOwnerSuitApplied) {
    addMultiplierBonus("void-suit", 1);
  }
  if (effect?.kind === "pattern-reproduction") {
    addMultiplierBonus(effect.kind, 2.5);
  }
  if (effect?.kind === "change-straight" && hand.id === "straight") {
    addMultiplierBonus(effect.kind, HAND_BY_ID.get("straight-flush").multiplier - hand.multiplier);
  }
  if (effect?.kind === "straight-flush-boost" && hand.id === "straight-flush") {
    addScoreBonus(effect.kind, 1000);
  }
  if (["shadow-swap", "void-erosion"].includes(effect?.kind)) {
    addGlobalChipBonus(effect.kind, 5);
    addMultiplierBonus(effect.kind, 1);
  }
  if (["world-mirror", "man-mirror"].includes(effect?.kind)) {
    addGlobalChipBonus(effect.kind, 6);
    addMultiplierBonus(effect.kind, 2);
  }
  if (effect?.kind === "shadow-targeting") {
    addGlobalChipBonus(effect.kind, Number(effect.gainedChipBonus) || 0);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "chaos-dice") {
    addGlobalChipBonus(effect.kind, Math.max(0, Number(effect.rerolledCardCount) || 0) * 0.5);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "draven") {
    addMultiplierBonus(effect.kind, 3.5);
  }
  if (effect?.kind === "rambo" && Number(context.turnElapsedMs) <= (effect.seconds || 15) * 1000) {
    addGlobalChipBonus(effect.kind, effect.amount || 10);
  }
  if (effect?.kind === "tomato-king") {
    addScoreBonus(effect.kind, Math.round((Number(effect.tomatoHits) || 0) * 1.5 * 10) / 10);
    addMultiplierBonus(effect.kind, 1);
  }
  if (effect?.kind === "tomato-shooter") {
    addScoreBonus(effect.kind, Math.round((Number(effect.tomatoThrows) || 0) * 1.5 * 10) / 10);
    addMultiplierBonus(effect.kind, 1);
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
    addChipFactor(effect.kind, 1.5);
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
  if (persistentEffects.breadButter && hand.id === "two-pair") {
    addGlobalChipBonus("bread-butter", 5);
    addMultiplierBonus("bread-butter", 2);
  }
  if (persistentEffects.breadCheese && hand.id === "three-kind") {
    addGlobalChipBonus("bread-cheese", 12);
    addMultiplierBonus("bread-cheese", 1);
  }
  if (persistentEffects.breadJam && hand.id === "straight") {
    addGlobalChipBonus("bread-jam", 3);
    addMultiplierBonus("bread-jam", 2);
  }
  if (persistentEffects.temperedTomato) {
    const hits = Math.max(0, Number(tomatoCounts.hitsTotal) || 0);
    const throws = Math.max(0, Number(tomatoCounts.throwsTotal) || 0);
    if (hits > 30 || throws > 50) {
      addScoreBonus("tempered-tomato", Math.round((hits * 0.5 + throws * 0.2) * 0.5 * 10) / 10);
    }
  }
  if (persistentEffects.returningFundamentals) {
    const bonuses = roundScaling(round, [0, 0, 12, 15, 15, 18], [0, 0, 1.25, 1.5, 1.5, 1.75]);
    addGlobalChipBonus("returning-fundamentals", bonuses.chips);
    addMultiplierBonus("returning-fundamentals", bonuses.multiplier);
  }
  if (persistentEffects.drawSword) {
    const bonuses = roundScaling(round, [0, 0, 12, 12, 12, 15], [0, 0, 1.5, 1.75, 1.75, 2]);
    addGlobalChipBonus("draw-sword", bonuses.chips);
    addMultiplierBonus("draw-sword", bonuses.multiplier);
  }
  if (persistentEffects.astralBody) {
    addScoreFactor("astral-body-penalty", 0.5);
  }
  if (persistentEffects.giantKiller) {
    addScoreFactor("giant-killer", giantKillerScoreFactor(context));
  }

  const chipTotalBeforeFactors = chips;
  if (chipFactor !== 1) {
    chips = Math.round(chips * chipFactor * 100) / 100;
  }

  const additiveMultiplierTotal = hand.multiplier + additiveMultiplier;
  let multiplier = additiveMultiplierTotal;
  for (const entry of multiplierFactors) multiplier *= entry.factor;
  const scoreBeforeBonuses = chips * multiplier * scoreFactor;
  const score = Math.min(1000000, Math.max(0, Math.floor(scoreBeforeBonuses + flatScoreBonus)));

  return {
    handId: hand.id,
    handName: hand.name,
    chips,
    baseMultiplier: hand.multiplier,
    bonusMultiplier: additiveMultiplier,
    additiveMultiplierTotal,
    multiplierFactors,
    multiplier,
    score,
    chipTotalBeforeFactors,
    chipFactors,
    cardValues,
    globalChipBonuses,
    multiplierBonuses,
    scoreBonuses,
    scoreFactors
  };
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
  return {
    chance: Math.min(1, Math.max(0, chance)),
    multiplier
  };
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
  if (gap <= 200) return 1.4;
  if (gap <= 300) return 1.5;
  if (gap <= 400) return 1.6;
  return 1.7;
}

function findBestPlay(handCards, communityCards, effect, options = {}) {
  const cards = handCards.concat(communityCards);
  if (cards.length < 5) throw new Error("Not enough cards to find a play.");
  const communityCodes = new Set(communityCards.map((card) => card.code));
  let best = null;
  forEachCombination(cards, 5, (selection) => {
    if (options.requireCommunity && !selection.some((card) => communityCodes.has(card.code))) return;
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

function randomItem(items) {
  return items[crypto.randomInt(items.length)];
}

module.exports = {
  HANDS,
  RANKS,
  SUITS,
  createDeck,
  createEffectOptions,
  criticalProfileForEffects,
  displayCode,
  findBestPlay,
  mirrorRankValue,
  rankValue,
  rankSymbol,
  scorePlay,
  shuffle
};
