const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createDeck,
  createEffectOptions,
  criticalProfileForEffects,
  effectAllowedInRound,
  fateCollectorBonus,
  fateDiceValueForRoll,
  fateTargetAdjustment,
  findBestPlay,
  giantDefenseScore,
  giantFatePenalty,
  giantKillerActiveInRound,
  giantKillerScoreFactor,
  royalFlushWins,
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
  assert.equal(suit.chips, 26);
  assert.equal(suit.multiplier, 2);
  assert.equal(suit.score, 52);

  const rank = scorePlay(high, { kind: "rank-chip", rank: "J" });
  assert.equal(rank.globalChipBonuses[0].amount, 10);
  assert.equal(rank.chips, 28);

  const red = scorePlay(high, { kind: "red-chip" });
  assert.equal(red.chips, 32);
  assert.deepEqual(red.cardValues.map((entry) => entry.bonuses.find((bonus) => bonus.kind === "red-chip").amount), [2, 4, 4, 2, 2]);

  const pair = scorePlay(cards(["4S", "4H", "7D", "8C", "9C"]), { kind: "pair-mult" });
  assert.equal(pair.globalChipBonuses[0].amount, 8);
  assert.equal(pair.bonusMultiplier, 2);

  const flush = scorePlay(cards(["2S", "5S", "7S", "9S", "JS"]), { kind: "flush-mult" });
  assert.equal(flush.globalChipBonuses[0].amount, 7);
  assert.equal(flush.multiplier, 7.5);
});

test("action effects apply their chip, multiplier, and final-score stages", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const voidErosion = scorePlay(high, { kind: "void-erosion", followingUnplayedPlayers: 2 });
  assert.equal(voidErosion.chips, 23);
  assert.equal(voidErosion.multiplier, 4);
  assert.equal(voidErosion.score, 232);

  const targeting = scorePlay(high, { kind: "shadow-targeting", gainedChipBonus: 27 });
  assert.equal(targeting.multiplier, 3);
  assert.equal(targeting.scoreBonuses.find((bonus) => bonus.kind === "shadow-targeting").amount, 270);
  assert.equal(targeting.score, 324);

  const chaos = scorePlay(high, { kind: "chaos-dice", rerolledCardCount: 9 });
  assert.equal(chaos.chips, 32.5);
  assert.equal(chaos.multiplier, 2);
  assert.equal(chaos.score, 155);

  const ramboTwenty = scorePlay(high, { kind: "rambo", seconds: 20 }, { turnElapsedMs: 20000 });
  assert.equal(ramboTwenty.chips, 33);
  assert.equal(ramboTwenty.multiplier, 2);
  assert.equal(ramboTwenty.score, 66);

  const ramboTen = scorePlay(high, { kind: "rambo", seconds: 20 }, { turnElapsedMs: 10000 });
  assert.equal(ramboTen.chips, 48);
  assert.equal(ramboTen.multiplier, 4);
  assert.equal(ramboTen.score, 192);

  const vigorous = scorePlay(high, { kind: "vigorous" });
  assert.equal(vigorous.scoreBonuses.find((bonus) => bonus.kind === "vigorous").amount, 104.5);
  assert.equal(vigorous.score, 122);
});

test("tomato final-score bonuses use the hand multiplier capped at two", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const king = scorePlay(high, { kind: "tomato-king", tomatoHits: 6 });
  assert.equal(king.scoreBonuses.find((bonus) => bonus.kind === "tomato-king").amount, 6);
  assert.equal(king.score, 42);

  const shooter = scorePlay(high, { kind: "tomato-shooter", tomatoThrows: 5 });
  assert.equal(shooter.scoreBonuses.find((bonus) => bonus.kind === "tomato-shooter").amount, 5);
  assert.equal(shooter.score, 41);

  const twoPairKing = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), { kind: "tomato-king", tomatoHits: 6 });
  assert.equal(twoPairKing.scoreBonuses.find((bonus) => bonus.kind === "tomato-king").amount, 12);

  const oldDays = scorePlay(high, { kind: "old-days-tomatoes", tomatoThrows: 10, tomatoHits: 999 });
  assert.equal(oldDays.globalChipBonuses.find((bonus) => bonus.kind === "old-days-tomatoes").amount, 5);
  assert.equal(oldDays.score, 23);

  const tempered = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), null, {
    persistentEffects: { temperedTomato: true },
    tomatoCounts: { hitsTotal: 90, throwsTotal: 60 }
  });
  assert.equal(tempered.scoreBonuses.find((bonus) => bonus.kind === "tempered-tomato").amount, 114);
  assert.equal(tempered.score, 189);
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

test("The Giant burden and Defense Stance use the new balance values", () => {
  assert.equal(giantFatePenalty([100, 400]), 200);
  assert.equal(giantFatePenalty([300, 400]), 390);
  assert.equal(giantDefenseScore(401), 200);
  assert.equal(giantDefenseScore(0), 0);
});

test("FATE target and collection rewards use their separate balance values", () => {
  assert.equal(fateTargetAdjustment("big-short", 3), 80);
  assert.equal(fateTargetAdjustment("going-long", 3), 50);
  assert.equal(fateTargetAdjustment("going-long", 5), 100);
  assert.equal(fateCollectorBonus(4), 300);
  assert.equal(fateCollectorBonus(5), 400);
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
  assert.equal(fateDiceValueForRoll(0), 3);
  assert.equal(fateDiceValueForRoll(0.199999), 3);
  assert.equal(fateDiceValueForRoll(0.2), 4);
  assert.equal(fateDiceValueForRoll(0.419999), 4);
  assert.equal(fateDiceValueForRoll(0.42), 5);
  assert.equal(fateDiceValueForRoll(0.769999), 6);
  assert.equal(fateDiceValueForRoll(0.77), 7);
  assert.equal(fateDiceValueForRoll(0.99), 20);
  assert.equal(fateDiceValueForRoll(0.999999), 20);
});

test("The Giant FATE adds one multiplier to every scored hand", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const result = scorePlay(high, null, { fateMultiplierBonus: 1 });
  assert.equal(result.baseMultiplier, 1);
  assert.equal(result.bonusMultiplier, 1);
  assert.equal(result.multiplier, 2);
  assert.equal(result.score, 36);
  assert.deepEqual(result.multiplierBonuses, [{ kind: "fate-giant", amount: 1 }]);
});

test("The Dice FATE replaces only the base hand multiplier", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const result = scorePlay(high, { kind: "suit-chip", suit: "S" }, { baseMultiplierOverride: 12 });
  assert.equal(result.naturalBaseMultiplier, 1);
  assert.equal(result.baseMultiplier, 12);
  assert.equal(result.bonusMultiplier, 1);
  assert.equal(result.multiplier, 13);
  assert.equal(result.score, 338);
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
  assert.equal(astral.score, 712);

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
