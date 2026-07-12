const test = require("node:test");
const assert = require("node:assert/strict");
const { createDeck, createEffectOptions, criticalProfileForEffects, effectAllowedInRound, findBestPlay, scorePlay } = require("../score-battle-engine");

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

  const rambo = scorePlay(high, { kind: "rambo", amount: 10, seconds: 20 }, { turnElapsedMs: 20000 });
  assert.equal(rambo.chips, 28);
  assert.equal(rambo.score, 178);

  const vigorous = scorePlay(high, { kind: "vigorous" });
  assert.equal(vigorous.scoreBonuses.find((bonus) => bonus.kind === "vigorous").amount, 104.5);
  assert.equal(vigorous.score, 122);
});

test("tomato effects use throws for Old days and the restored x5 final bonuses", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const king = scorePlay(high, { kind: "tomato-king", tomatoHits: 6 });
  assert.equal(king.scoreBonuses.find((bonus) => bonus.kind === "tomato-king").amount, 30);
  assert.equal(king.score, 66);

  const shooter = scorePlay(high, { kind: "tomato-shooter", tomatoThrows: 5 });
  assert.equal(shooter.scoreBonuses.find((bonus) => bonus.kind === "tomato-shooter").amount, 25);
  assert.equal(shooter.score, 61);

  const oldDays = scorePlay(high, { kind: "old-days-tomatoes", tomatoThrows: 10, tomatoHits: 999 });
  assert.equal(oldDays.globalChipBonuses.find((bonus) => bonus.kind === "old-days-tomatoes").amount, 5);
  assert.equal(oldDays.score, 23);

  const tempered = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), null, {
    persistentEffects: { temperedTomato: true },
    tomatoCounts: { hitsTotal: 90, throwsTotal: 60 }
  });
  assert.equal(tempered.scoreBonuses.find((bonus) => bonus.kind === "tempered-tomato").amount, 285);
  assert.equal(tempered.score, 360);
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
