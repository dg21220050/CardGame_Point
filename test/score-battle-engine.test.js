const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FATE_DICE_OUTCOMES,
  americanPsychoAssassinationEligibleSeatIds,
  americanPsychoNextRoundBonus,
  americanPsychoQualifyingTargetSeatIds,
  americanPsychoSettlementPlan,
  americanPsychoSettledRoundScore,
  createDeck,
  createEffectOptions,
  criticalProfileForEffects,
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
  findBestPlay,
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
  mirrorRankDifference,
  nextFatePredictionSuccessCount,
  personaBorrowLimit,
  royalFlushWins,
  scoreEndingIds,
  scoreLossEndingIds,
  scorePlay,
  tomatoCountRouting,
  tomatoThrowAllowed
} = require("../score-battle-engine");

function cards(codes) {
  const byCode = new Map(createDeck().map((card) => [card.code, card]));
  return codes.map((code) => byCode.get(code));
}

test("made-hand cards and kickers both contribute the intended base chips", () => {
  const high = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]));
  assert.equal(high.handId, "high-card");
  assert.equal(high.chips, 18);
  assert.equal(high.kickerChips, 7);
  assert.deepEqual(high.cardValues.map((entry) => entry.baseChips), [0, 2, 2, 3, 11]);
  assert.equal(high.score, 18);

  const pair = scorePlay(cards(["4S", "4H", "AH", "KC", "QD"]));
  assert.equal(pair.handId, "one-pair");
  assert.equal(pair.chips, 23);
  assert.equal(pair.kickerChips, 15);
});

test("kicker chips can crit while their pre-crit total stays capped", () => {
  const result = scorePlay(cards(["AS", "KH", "QD", "JC", "9S"]), null, {
    persistentEffects: { criticalHit: true },
    criticalRolls: [true, true, true, true, true]
  });
  assert.equal(result.kickerChips, 16);
  assert.equal(result.criticalTriggered, true);
  assert.equal(result.cardValues.filter((entry) => entry.scoresHand === false).every((entry) => (
    entry.bonuses.some((bonus) => bonus.kind === "critical-hit" && bonus.critical)
  )), true);
});

test("a round without a crit receives the final-score consolation bonus", () => {
  const noCritChance = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]));
  assert.equal(noCritChance.score, 18);
  assert.equal(noCritChance.scoreBonuses.some((bonus) => bonus.kind === "no-critical-hit"), false);

  const missed = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), null, {
    persistentEffects: { criticalHit: true },
    criticalRolls: [false, false, false, false, false]
  });
  assert.equal(missed.score, 118);
  assert.deepEqual(missed.scoreBonuses, [{ kind: "no-critical-hit", amount: 100 }]);

  const crit = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), null, {
    persistentEffects: { criticalHit: true },
    criticalRolls: [false, false, false, false, true]
  });
  assert.equal(crit.criticalTriggered, true);
  assert.equal(crit.scoreBonuses.some((bonus) => bonus.kind === "no-critical-hit"), false);
});

test("suit, rank, red, pair, and flush boosts use the new values", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const suit = scorePlay(high, { kind: "suit-chip", suit: "S" });
  assert.equal(suit.chips, 38);
  assert.equal(suit.multiplier, 2);
  assert.equal(suit.score, 76);

  const rank = scorePlay(high, { kind: "rank-chip", rank: "J" });
  assert.equal(rank.globalChipBonuses[0].amount, 20);
  assert.equal(rank.chips, 38);
  assert.equal(rank.multiplier, 2);

  const red = scorePlay(high, { kind: "red-chip" });
  assert.equal(red.chips, 47);
  assert.equal(red.multiplier, 3);
  assert.deepEqual(red.cardValues.map((entry) => entry.bonuses.find((bonus) => bonus.kind === "red-chip").amount), [5, 7, 7, 5, 5]);

  const pair = scorePlay(cards(["4S", "4H", "7D", "8C", "9C"]), { kind: "pair-mult" });
  assert.equal(pair.globalChipBonuses[0].amount, 12);
  assert.equal(pair.bonusMultiplier, 2.5);

  const flush = scorePlay(cards(["2S", "5S", "7S", "9S", "JS"]), { kind: "flush-mult" });
  assert.equal(flush.globalChipBonuses[0].amount, 7);
  assert.equal(flush.multiplier, 7.5);
});

test("action effects apply their chip, multiplier, and final-score stages", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const voidErosion = scorePlay(high, { kind: "void-erosion", followingUnplayedPlayers: 2 });
  assert.equal(voidErosion.chips, 23);
  assert.equal(voidErosion.multiplier, 4);
  assert.equal(voidErosion.score, 152);

  const targeting = scorePlay(high, { kind: "shadow-targeting", gainedChipBonus: 27 });
  assert.equal(targeting.multiplier, 3);
  assert.equal(targeting.scoreBonuses.find((bonus) => bonus.kind === "shadow-targeting").amount, 270);
  assert.equal(targeting.score, 324);

  const chaos = scorePlay(high, { kind: "chaos-dice", rerolledCardCount: 9 });
  assert.equal(chaos.chips, 32.5);
  assert.equal(chaos.multiplier, 2);
  assert.equal(chaos.score, 155);

  const ramboTwenty = scorePlay(high, { kind: "rambo", seconds: 20 }, { turnElapsedMs: 20000 });
  assert.equal(ramboTwenty.chips, 48);
  assert.equal(ramboTwenty.multiplier, 3);
  assert.equal(ramboTwenty.score, 144);

  const ramboTen = scorePlay(high, { kind: "rambo", seconds: 20 }, { turnElapsedMs: 10000 });
  assert.equal(ramboTen.chips, 78);
  assert.equal(ramboTen.multiplier, 5);
  assert.equal(ramboTen.score, 390);

  const vigorous = scorePlay(high, { kind: "vigorous" });
  assert.equal(vigorous.scoreBonuses.find((bonus) => bonus.kind === "vigorous").amount, 104.5);
  assert.equal(vigorous.score, 122);
});

test("swap, mirror, GOELIA, and Void Seal use their recorded point differences", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const swap = scorePlay(high, { kind: "shadow-swap", swappedChipDifference: 6 });
  assert.equal(swap.globalChipBonuses[0].amount, 7);
  assert.equal(swap.multiplier, 2);

  const world = scorePlay(high, { kind: "world-mirror", mirrorChipDifference: 32 });
  assert.equal(world.globalChipBonuses[0].amount, 32);
  assert.equal(world.multiplier, 2);
  assert.equal(mirrorRankDifference(14), 12);
  assert.equal(mirrorRankDifference(13), 12);
  assert.equal(fateChipValue(cards(["AS"])[0]), 15);

  const goelia = scorePlay(high, { kind: "goelia", rankDifferenceTotal: 17 });
  assert.equal(goelia.globalChipBonuses[0].amount, 17);

  const owner = scorePlay(high, { kind: "void-suit", suit: "H" }, {
    seatId: "owner",
    roundEffects: [{ kind: "void-suit", suit: "H", amount: 3, sourceSeatId: "owner" }]
  });
  assert.equal(owner.cardValues[1].bonuses.find((bonus) => bonus.kind === "void-suit").amount, 12);
  assert.equal(owner.bonusMultiplier, 2);

  const opponent = scorePlay(high, null, {
    seatId: "opponent",
    roundEffects: [{ kind: "void-suit", suit: "H", amount: 3, sourceSeatId: "owner" }]
  });
  assert.equal(opponent.cardValues[1].bonuses.find((bonus) => bonus.kind === "void-suit").amount, -2);
});

test("Tomato King and Tomato Shooter cap the hand multiplier at two", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const king = scorePlay(high, { kind: "tomato-king", tomatoHits: 6 });
  assert.equal(king.scoreBonuses.find((bonus) => bonus.kind === "tomato-king").amount, 6);
  assert.equal(king.score, 42);

  const shooter = scorePlay(high, { kind: "tomato-shooter", tomatoThrows: 5 });
  assert.equal(shooter.scoreBonuses.find((bonus) => bonus.kind === "tomato-shooter").amount, 5);
  assert.equal(shooter.score, 41);

  const twoPairKing = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), { kind: "tomato-king", tomatoHits: 6 });
  assert.equal(twoPairKing.scoreBonuses.find((bonus) => bonus.kind === "tomato-king").amount, 12);

  const oldDays = scorePlay(high, { kind: "old-days-tomatoes", tomatoThrows: 10, tomatoHits: 4 });
  assert.equal(oldDays.globalChipBonuses.find((bonus) => bonus.kind === "old-days-tomatoes").amount, 14);
  assert.equal(oldDays.score, 32);

  const tempered = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), null, {
    persistentEffects: { temperedTomato: true },
    tomatoCounts: { hitsTotal: 90, throwsTotal: 60 }
  });
  assert.equal(tempered.scoreBonuses.find((bonus) => bonus.kind === "tempered-tomato").amount, 57);
  assert.equal(tempered.score, 132);
});

test("a 10-J-Q-K-A straight flush is marked as an instant-win Royal Flush", () => {
  for (const suit of ["S", "H", "D", "C"]) {
    const royal = scorePlay(cards([`T${suit}`, `J${suit}`, `Q${suit}`, `K${suit}`, `A${suit}`]));
    assert.equal(royal.handId, "straight-flush");
    assert.equal(royal.isRoyalFlush, true);
  }
  assert.equal(scorePlay(cards(["9S", "TS", "JS", "QS", "KS"])).isRoyalFlush, false);
});

test("only the single selected Royal Flush suit wins instantly", () => {
  const winningSuits = ["H"];
  assert.equal(royalFlushWins(cards(["TH", "JH", "QH", "KH", "AH"]), winningSuits), true);
  assert.equal(royalFlushWins(cards(["TC", "JC", "QC", "KC", "AC"]), winningSuits), false);
  assert.equal(royalFlushWins(cards(["TS", "JS", "QS", "KS", "AS"]), winningSuits), false);
  assert.equal(royalFlushWins(cards(["TD", "JD", "QD", "KD", "AD"]), winningSuits), false);
});

test("The Giant burden, AOE, and Smash use the new balance values", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(giantHandSize), [4, 5, 5, 5, 5]);
  assert.equal(giantFatePenalty([100, 400]), 200);
  assert.equal(giantFatePenalty([300, 400]), 390);
  assert.deepEqual([1, 2, 3, 4, 5].map(() => giantAoePenalty(100)), [30, 30, 30, 30, 30]);
  assert.equal(giantAoePenalty(0), 0);
  assert.equal(giantSmashPenalty(401), 120);
  assert.equal(giantLeaderSmashPenalty(401), 240);
});

test("The Giant's Smash targets low scorers and separately targets every tied non-Giant leader", () => {
  const plan = giantSettlementPlan([
    { seatId: "giant", roundScore: 900 },
    { seatId: "below-giant", roundScore: 300 },
    { seatId: "equal-giant", roundScore: 401 },
    { seatId: "leader-a", roundScore: 500 },
    { seatId: "leader-b", roundScore: 500 }
  ], "giant", 401);

  assert.equal(plan.burdenPenalty, 390);
  assert.equal(plan.aoePenalty, 120);
  assert.deepEqual(plan.aoeTargetSeatIds, ["below-giant", "equal-giant", "leader-a", "leader-b"]);
  assert.equal(plan.smashPenalty, 120);
  assert.deepEqual(plan.smashTargetSeatIds, ["below-giant"]);
  assert.equal(plan.leaderSmashPenalty, 240);
  assert.deepEqual(plan.leaderSmashTargetSeatIds, ["leader-a", "leader-b"]);

  const overlapping = giantSettlementPlan([
    { seatId: "giant", roundScore: 900 },
    { seatId: "low", roundScore: 300 },
    { seatId: "leader", roundScore: 500 }
  ], "giant", 600);
  assert.deepEqual(overlapping.smashTargetSeatIds, ["low", "leader"]);
  assert.deepEqual(overlapping.leaderSmashTargetSeatIds, ["leader"]);
});

test("FATE collection rewards use their separate balance values", () => {
  assert.equal(fateCollectorBonus(4), 300);
  assert.equal(fateCollectorBonus(5), 400);
});

test("FATE predictions use unmodified current-round scores", () => {
  const plan = fatePredictionPlan([
    { seatId: "long-target", roundScore: 100 },
    { seatId: "short-target", roundScore: 110 },
    { seatId: "long-player", roundScore: 95 },
    { seatId: "short-player", roundScore: 100 }
  ], [
    { seatId: "long-player", fateKind: "going-long", targetSeatId: "long-target" },
    { seatId: "short-player", fateKind: "big-short", targetSeatId: "short-target" }
  ]);

  assert.equal(plan.roundScores["long-target"], 100);
  assert.equal(plan.roundScores["short-target"], 110);
  assert.deepEqual(plan.outcomes, [
    { seatId: "long-player", targetSeatId: "long-target", correct: false },
    { seatId: "short-player", targetSeatId: "short-target", correct: false }
  ]);
  assert.equal(fatePredictionCorrect("going-long", 110, Object.values(plan.roundScores)), true);
  assert.equal(fatePredictionCorrect("big-short", 95, Object.values(plan.roundScores)), true);
});

test("FATE prediction successes accumulate without resetting after a miss", () => {
  assert.equal(nextFatePredictionSuccessCount(2, false), 2);
  assert.equal(nextFatePredictionSuccessCount(2, true), 3);
  assert.equal(fatePredictionSuccessBonus(1), 0);
  assert.equal(fatePredictionSuccessBonus(2), 50);
  assert.equal(fatePredictionSuccessBonus(3), 100);
  assert.equal(fatePredictionSuccessBonus(5), 500);
});

test("Big Short and Going Long accept every player tied at the relevant extreme", () => {
  const plan = fatePredictionPlan([
    { seatId: "high-a", roundScore: 200 },
    { seatId: "high-b", roundScore: 200 },
    { seatId: "low-a", roundScore: 50 },
    { seatId: "low-b", roundScore: 50 }
  ], [
    { seatId: "high-a", fateKind: "going-long", targetSeatId: "high-b" },
    { seatId: "low-a", fateKind: "big-short", targetSeatId: "low-b" }
  ]);

  assert.deepEqual(plan.highestSeatIds.sort(), ["high-a", "high-b"]);
  assert.deepEqual(plan.lowestSeatIds.sort(), ["low-a", "low-b"]);
  assert.deepEqual(plan.outcomes.map((outcome) => outcome.correct), [true, true]);
});

test("FATE starting discard uses include the three six-discard prediction builds", () => {
  assert.equal(fateStartingDiscardUses("giant"), 8);
  assert.equal(fateStartingDiscardUses("dice"), 6);
  assert.equal(fateStartingDiscardUses("big-short"), 6);
  assert.equal(fateStartingDiscardUses("going-long"), 6);
  assert.equal(fateStartingDiscardUses("fate-collector"), 6);
  assert.equal(fateStartingDiscardUses("clod"), 6);
  assert.equal(fateStartingDiscardUses("hanged-man"), 5);
  assert.equal(fateStartingDiscardUses("persona"), 3);
  assert.equal(fateStartingDiscardUses("american-psycho"), 5);
  assert.equal(fateStartingDiscardUses("unknown", 4), 4);
});

test("The Dice gains permanent dice from Shadow Swap and Void Erosion", () => {
  assert.equal(effectAddsFateDie("shadow-swap"), true);
  assert.equal(effectAddsFateDie("void-erosion"), true);
  assert.equal(effectAddsFateDie("red-chip"), false);
});

test("The Hanged Man reverses non-Ace chips and raises its listed hand multipliers to six", () => {
  const deck = createDeck();
  assert.equal(fateChipValue(deck.find((card) => card.code === "2S"), "hanged-man"), 12);
  assert.equal(fateChipValue(deck.find((card) => card.code === "KS"), "hanged-man"), 1);
  assert.equal(fateChipValue(deck.find((card) => card.code === "AS"), "hanged-man"), 15);

  const high = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), null, { fateKind: "hanged-man" });
  assert.equal(high.baseMultiplier, 6);
  assert.equal(high.chips, 14);
  assert.equal(high.score, 84);

  const flush = scorePlay(cards(["2S", "5S", "7S", "9S", "JS"]), null, { fateKind: "hanged-man" });
  assert.equal(flush.baseMultiplier, 6);
});

test("Persona can copy at most one revealed card in every round", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(personaBorrowLimit), [1, 1, 1, 1, 1]);
});

test("American Psycho converts end-of-round standings into capped next-round bonuses", () => {
  assert.deepEqual(americanPsychoNextRoundBonus(0, 3), {
    higherTotalCount: 0,
    higherRoundCount: 3,
    chips: 15,
    multiplier: 1
  });
  assert.equal(americanPsychoNextRoundBonus(3, 2).multiplier, 3);
  assert.equal(americanPsychoNextRoundBonus(7, 1).multiplier, 3);
  assert.equal(americanPsychoSettledRoundScore(101, 0, 0), 70);
  assert.equal(americanPsychoSettledRoundScore(101, 0, 1), 101);

  const result = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), null, {
    americanPsychoBonus: americanPsychoNextRoundBonus(4, 2)
  });
  assert.equal(result.chips, 28);
  assert.equal(result.multiplier, 4);
  assert.equal(result.score, 112);

  const giantAbove = americanPsychoSettlementPlan([
    { seatId: "psycho", totalScore: 3500, roundScore: 200 },
    { seatId: "giant", totalScore: 3600, roundScore: 100 }
  ], "psycho");
  assert.equal(giantAbove.higherTotalCount, 1);
  assert.equal(giantAbove.higherRoundCount, 0);
  assert.equal(giantAbove.scoreReduction, 0);

  const recomputed = americanPsychoSettlementPlan([
    { seatId: "psycho", totalScore: 3700, roundScore: 1000 },
    { seatId: "giant", totalScore: 3600, roundScore: 900 },
    { seatId: "other", totalScore: 3500, roundScore: 800 }
  ], "psycho");
  assert.equal(recomputed.scoreReduction, 300);
  assert.equal(recomputed.settledRoundScore, 700);
  assert.equal(recomputed.higherTotalCount, 2);
  assert.equal(recomputed.higherRoundCount, 2);
  assert.deepEqual(recomputed.nextRoundBonus, {
    higherTotalCount: 2,
    higherRoundCount: 2,
    chips: 10,
    multiplier: 2
  });
});

test("American Psycho Assassination qualification requires both scores to be strictly higher", () => {
  const seats = [
    { seatId: "psycho", totalScore: 500, roundScore: 100 },
    { seatId: "both", totalScore: 501, roundScore: 101 },
    { seatId: "total-only", totalScore: 600, roundScore: 90 },
    { seatId: "round-only", totalScore: 400, roundScore: 120 },
    { seatId: "ties", totalScore: 500, roundScore: 100 }
  ];
  assert.deepEqual(americanPsychoQualifyingTargetSeatIds(seats, "psycho"), ["both"]);
});

test("American Psycho cannot assassinate the same target twice", () => {
  const seats = [{ seatId: "psycho" }, { seatId: "first" }, { seatId: "second" }];
  const progress = { first: 4, second: 3 };
  assert.deepEqual(
    americanPsychoAssassinationEligibleSeatIds(seats, "psycho", progress, ["first"]),
    ["second"]
  );
  assert.deepEqual(
    americanPsychoAssassinationEligibleSeatIds(seats, "psycho", progress, ["first", "second"]),
    []
  );
});

test("American Psycho cannot target a player whose Assassination was escaped", () => {
  const seats = [{ seatId: "psycho" }, { seatId: "escaped" }, { seatId: "available" }];
  const progress = { escaped: 4, available: 3 };
  assert.deepEqual(
    americanPsychoAssassinationEligibleSeatIds(seats, "psycho", progress, ["escaped"]),
    ["available"]
  );
});

test("score battle loss endings stack without replacing Fate-specific endings", () => {
  assert.deepEqual(scoreLossEndingIds({
    fateKind: "american-psycho",
    totalScore: 0,
    giantReducedToZero: true,
    assassinationDamageTaken: 250,
    tomatoEffectChosen: true,
    royalVictory: true
  }), [
    "giant-zero-release",
    "assassinated-by-american-psycho",
    "greenhouse-tomatoes",
    "american-psycho-paul-allen",
    "royal-flush-someone-cheated"
  ]);

  assert.deepEqual(scoreLossEndingIds({
    fateKind: "giant",
    totalScore: 0,
    giantReducedToZero: true
  }), ["giant-david"]);
});

test("every requested losing FATE has its own ending", () => {
  assert.deepEqual([
    "hanged-man",
    "persona",
    "american-psycho",
    "clod",
    "dice",
    "fate-collector",
    "big-short",
    "going-long"
  ].map((fateKind) => scoreLossEndingIds({ fateKind })[0]), [
    "hanged-man-health",
    "persona-miss",
    "american-psycho-paul-allen",
    "clod-chocolate",
    "dice-probability",
    "collector-loss",
    "big-short-kurumi",
    "going-long-kurumi"
  ]);
});

test("winning endings stack FATE, escape, tomato, and Royal Flush rules", () => {
  assert.deepEqual(scoreEndingIds({
    won: true,
    fateKind: "giant",
    escapedAssassination: true,
    tomatoEffectChosen: true
  }), ["escaped-american-psycho", "giant-small-step", "tomato-god"]);

  assert.deepEqual(scoreEndingIds({
    won: true,
    fateKind: "persona",
    tomatoEffectChosen: true,
    wonByRoyalFlush: true,
    gameEndedByRoyalFlush: true
  }), ["persona-own-cards", "royal-flush-exodia"]);

  assert.deepEqual(scoreEndingIds({
    won: false,
    fateKind: "dice",
    escapedAssassination: true,
    gameEndedByRoyalFlush: true
  }), ["escaped-american-psycho", "dice-probability", "royal-flush-someone-cheated"]);
});

test("Persona copy marks halve the original physical card's base chips", () => {
  const high = cards(["2S", "5H", "7D", "9C", "AS"]);
  const normal = scorePlay(high);
  high.find((card) => card.code === "AS").personaWeakened = true;
  const weakened = scorePlay(high);
  const ace = weakened.cardValues.find((entry) => entry.code === "AS");

  assert.equal(normal.chips, 22);
  assert.equal(ace.printedChips, 7.5);
  assert.equal(ace.bonuses.some((bonus) => bonus.kind === "persona-card-penalty" && bonus.factor === 0.5), true);
  assert.equal(weakened.chips, 14.5);
  assert.equal(weakened.score, 14);
});

test("Weakened reduces the complete hand result to 75% for one scoring context", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const normal = scorePlay(high, { kind: "shadow-swap", swappedChipDifference: 6 });
  const weakened = scorePlay(high, { kind: "shadow-swap", swappedChipDifference: 6 }, { weaknessActive: true });
  assert.equal(weakened.score, Math.floor(normal.score * 0.75));
  assert.equal(weakened.finalScoreFactors.some((entry) => entry.kind === "weakness" && entry.factor === 0.75), true);
});

test("Giant Killer uses the reduced gap multipliers", () => {
  assert.equal(giantKillerScoreFactor({ highestTotalScoreBeforeRound: 1000, totalScoreBeforeRound: 950 }), 1.3);
  assert.equal(giantKillerScoreFactor({ highestTotalScoreBeforeRound: 1000, totalScoreBeforeRound: 850 }), 1.45);
  assert.equal(giantKillerScoreFactor({ highestTotalScoreBeforeRound: 1000, totalScoreBeforeRound: 750 }), 1.6);
  assert.equal(giantKillerScoreFactor({ highestTotalScoreBeforeRound: 1000, totalScoreBeforeRound: 650 }), 1.75);
  assert.equal(giantKillerScoreFactor({ highestTotalScoreBeforeRound: 1000, totalScoreBeforeRound: 500 }), 1.9);
  assert.equal(giantKillerActiveInRound(3, 2), true);
  assert.equal(giantKillerActiveInRound(3, 3), true);
  assert.equal(giantKillerActiveInRound(3, 4), false);
});

test("Dance of Illusions routes tomato counts to throws instead of self-hits", () => {
  assert.deepEqual(tomatoCountRouting(false, false), { countsForThrower: true, countsForTarget: true });
  assert.deepEqual(tomatoCountRouting(true, false), { countsForThrower: true, countsForTarget: false });
  assert.deepEqual(tomatoCountRouting(false, true), { countsForThrower: false, countsForTarget: true });
  assert.deepEqual(tomatoCountRouting(true, true), { countsForThrower: true, countsForTarget: false });
});

test("Score Battle tomatoes are allowed only during another player's active turn", () => {
  assert.equal(tomatoThrowAllowed("play-select", "seat-2", "seat-1"), true);
  assert.equal(tomatoThrowAllowed("play-select", "seat-1", "seat-1"), false);
  assert.equal(tomatoThrowAllowed("round-result", "seat-2", "seat-1"), false);
  assert.equal(tomatoThrowAllowed("play-select", "", "seat-1"), false);
});

test("FATE dice probabilities use the documented cumulative boundaries", () => {
  assert.ok(Math.abs(FATE_DICE_OUTCOMES.reduce((sum, outcome) => sum + outcome.probability, 0) - 1) < 1e-12);
  assert.equal(fateDiceValueForRoll(0), 3);
  assert.equal(fateDiceValueForRoll(0.024999), 3);
  assert.equal(fateDiceValueForRoll(0.025), 4);
  assert.equal(fateDiceValueForRoll(0.074999), 4);
  assert.equal(fateDiceValueForRoll(0.075), 5);
  assert.equal(fateDiceValueForRoll(0.159999), 5);
  assert.equal(fateDiceValueForRoll(0.16), 6);
  assert.equal(fateDiceValueForRoll(0.359999), 6);
  assert.equal(fateDiceValueForRoll(0.36), 7);
  assert.equal(fateDiceValueForRoll(0.569999), 7);
  assert.equal(fateDiceValueForRoll(0.57), 8);
  assert.equal(fateDiceValueForRoll(0.769999), 8);
  assert.equal(fateDiceValueForRoll(0.77), 10);
  assert.equal(fateDiceValueForRoll(0.899999), 10);
  assert.equal(fateDiceValueForRoll(0.9), 12);
  assert.equal(fateDiceValueForRoll(0.959999), 12);
  assert.equal(fateDiceValueForRoll(0.96), 15);
  assert.equal(fateDiceValueForRoll(0.989999), 15);
  assert.equal(fateDiceValueForRoll(0.99), 20);
  assert.equal(fateDiceValueForRoll(0.999999), 20);
});

test("every x3 FATE roll immediately grants one Misfortune compensation roll", () => {
  assert.equal(fateDiceMisfortuneExtraRolls(3), 1);
  assert.equal(fateDiceMisfortuneExtraRolls(4), 0);
  assert.equal(fateDiceMisfortuneExtraRolls(20), 0);
});

test("The Giant FATE adds an inherent multiplier", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const result = scorePlay(high, null, { fateKind: "giant" });
  assert.equal(result.baseMultiplier, 1);
  assert.equal(result.bonusMultiplier, 1);
  assert.equal(result.multiplier, 2);
  assert.equal(result.score, 36);
  assert.deepEqual(result.multiplierBonuses, [{ kind: "fate-giant", amount: 1 }]);
});

test("The Dice FATE compares both base multipliers after adding effect bonuses", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const result = scorePlay(high, { kind: "suit-chip", suit: "S" }, { fateDiceMultiplier: 12 });
  assert.equal(result.naturalBaseMultiplier, 1);
  assert.equal(result.baseMultiplier, 1);
  assert.equal(result.bonusMultiplier, 1);
  assert.equal(result.multiplierBeforeFateDice, 2);
  assert.equal(result.multiplier, 13);
  assert.equal(result.score, 494);

  const changedStraight = scorePlay(cards(["AS", "2H", "3D", "4C", "5S"]), { kind: "change-straight" }, { fateDiceMultiplier: 6 });
  assert.equal(changedStraight.naturalBaseMultiplier, 5);
  assert.equal(changedStraight.bonusMultiplier, 10);
  assert.equal(changedStraight.multiplierBeforeFateDice, 15);
  assert.equal(changedStraight.multiplier, 16);

  const persistentBonus = scorePlay(high, null, {
    fateDiceMultiplier: 6,
    round: 2,
    persistentEffects: { drawSword: true }
  });
  assert.equal(persistentBonus.bonusMultiplier, 2.25);
  assert.equal(persistentBonus.multiplier, 8.25);

  const straightFlush = scorePlay(cards(["9S", "TS", "JS", "QS", "KS"]), null, { fateDiceMultiplier: 3 });
  assert.equal(straightFlush.naturalBaseMultiplier, 15);
  assert.equal(straightFlush.baseMultiplier, 15);
  assert.equal(straightFlush.bonusMultiplier, 0);
  assert.equal(straightFlush.multiplier, 15);

  const boostedStraightFlush = scorePlay(
    cards(["9S", "TS", "JS", "QS", "KS"]),
    { kind: "suit-chip", suit: "S" },
    { fateDiceMultiplier: 3 }
  );
  assert.equal(boostedStraightFlush.bonusMultiplier, 1);
  assert.equal(boostedStraightFlush.multiplierBeforeFateDice, 16);
  assert.equal(boostedStraightFlush.multiplier, 16);
});

test("The Giant's Defense Stance reduces only the burden by its round percentage", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(giantDefenseReduction), [0.8, 0.7, 0.6, 0.5, 0.4]);
  assert.deepEqual([1, 2, 3, 4, 5].map((round) => giantDefensePenalty(100, round)), [20, 30, 40, 50, 60]);
});

test("bread effects, Astral Body, and crit profiles follow the new rules", () => {
  const cheese = scorePlay(cards(["4S", "4H", "4D", "8C", "9C"]), null, { persistentEffects: { breadCheese: true } });
  assert.equal(cheese.chips, 30);
  assert.equal(cheese.multiplier, 5);
  assert.equal(cheese.score, 150);

  const butter = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), null, { persistentEffects: { breadButter: true } });
  assert.equal(butter.chips, 34);
  assert.equal(butter.multiplier, 5);
  assert.equal(butter.score, 170);

  const jam = scorePlay(cards(["AS", "2H", "3D", "4C", "5S"]), null, { persistentEffects: { breadJam: true } });
  assert.equal(jam.chips, 38);
  assert.equal(jam.multiplier, 7);
  assert.equal(jam.score, 266);

  const astral = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), { kind: "astral-body" }, {
    round: 2,
    persistentEffects: { astralBody: true }
  });
  assert.equal(astral.finalScoreFactors[0].factor, 0.7);
  assert.equal(astral.score, 1012);

  const astralRoundFive = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]), null, {
    round: 5,
    persistentEffects: { astralBody: true }
  });
  assert.equal(astralRoundFive.finalScoreFactors.length, 0);
  assert.equal(astralRoundFive.score, 18);

  const profile = criticalProfileForEffects({ danceIllusions: true, runaansHurricane: true });
  assert.equal(profile.chance, 0.5);
  assert.equal(profile.multiplier, 1.75);
});

test("restricted effects appear only in their intended rounds", () => {
  assert.equal(effectAllowedInRound("old-days-tomatoes", 4), false);
  assert.equal(effectAllowedInRound("old-days-tomatoes", 5), true);
  assert.equal(effectAllowedInRound("astral-body", 4), true);
  assert.equal(effectAllowedInRound("astral-body", 5), false);
  for (let index = 0; index < 30; index += 1) {
    const options = createEffectOptions({ round: 5 });
    assert.equal(options.some((effect) => effect.kind === "astral-body"), false);
  }
});

test("findBestPlay still enforces a community card", () => {
  const hand = cards(["TH", "JH", "QH", "KH", "AH"]);
  const community = cards(["2C", "3D", "4S", "5C", "9D"]);
  const best = findBestPlay(hand, community, null, { requireCommunity: true });
  assert.equal(best.cards.some((card) => community.some((communityCard) => communityCard.code === card.code)), true);
  assert.notEqual(best.result.handId, "straight-flush");
});
