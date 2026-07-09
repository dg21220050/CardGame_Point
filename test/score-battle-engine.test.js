const test = require("node:test");
const assert = require("node:assert/strict");
const { createDeck, createEffectOptions, criticalProfileForEffects, findBestPlay, scorePlay } = require("../score-battle-engine");

function cards(codes) {
  const byCode = new Map(createDeck().map((card) => [card.code, card]));
  return codes.map((code) => byCode.get(code));
}

test("scores an exact five-card straight flush", () => {
  const result = scorePlay(cards(["TH", "JH", "QH", "KH", "AH"]));
  assert.equal(result.handId, "straight-flush");
  assert.equal(result.chips, 61);
  assert.equal(result.multiplier, 15);
  assert.equal(result.score, 915);
});

test("recognizes an ace-low straight while ace keeps fifteen chips", () => {
  const result = scorePlay(cards(["AS", "2H", "3D", "4C", "5S"]));
  assert.equal(result.handId, "straight");
  assert.equal(result.chips, 29);
  assert.equal(result.score, 145);
});

test("applies a round void-suit chip reduction before multiplying", () => {
  const result = scorePlay(cards(["2S", "3S", "4H", "4D", "9C"]), null, {
    roundEffects: [{ kind: "void-suit", suit: "S", amount: 3 }]
  });
  assert.equal(result.handId, "one-pair");
  assert.equal(result.chips, 8);
  assert.equal(result.multiplier, 2);
  assert.equal(result.score, 16);
});

test("only made-hand cards contribute base chips", () => {
  const high = scorePlay(cards(["2S", "5H", "7D", "9C", "JS"]));
  assert.equal(high.handId, "high-card");
  assert.equal(high.chips, 11);
  assert.deepEqual(high.cardValues.map((entry) => entry.scoresHand), [false, false, false, false, true]);

  const pair = scorePlay(cards(["4S", "4H", "7D", "8C", "9C"]));
  assert.equal(pair.handId, "one-pair");
  assert.equal(pair.chips, 8);
  assert.deepEqual(pair.cardValues.map((entry) => entry.scoresHand), [true, true, false, false, false]);

  const trips = scorePlay(cards(["4S", "4H", "4D", "8C", "9C"]));
  assert.equal(trips.handId, "three-kind");
  assert.equal(trips.chips, 12);
  assert.deepEqual(trips.cardValues.map((entry) => entry.scoresHand), [true, true, true, false, false]);
});

test("chip effects can add chips to non-scoring cards without enabling crits", () => {
  const result = scorePlay(cards(["4S", "4C", "AH", "7D", "9C"]), { kind: "red-chip", amount: 3 }, {
    persistentEffects: { criticalHit: true },
    criticalRolls: [true, true, true, true, true]
  });

  assert.equal(result.handId, "one-pair");
  assert.equal(result.chips, 20);
  assert.equal(result.cardValues.filter((entry) => entry.scoresHand).length, 2);
  assert.equal(result.cardValues.filter((entry) => entry.bonuses.some((bonus) => bonus.kind === "critical-hit")).length, 2);
  assert.equal(result.cardValues.find((entry) => entry.code === "AH").finalChips, 3);
});

test("pair engine only boosts one pair and two pair", () => {
  const trips = scorePlay(cards(["4S", "4H", "4D", "8C", "9C"]), { kind: "pair-mult", amount: 2 });
  const pair = scorePlay(cards(["4S", "4H", "7D", "8C", "9C"]), { kind: "pair-mult", amount: 2 });
  assert.equal(trips.handId, "three-kind");
  assert.equal(trips.bonusMultiplier, 0);
  assert.equal(pair.handId, "one-pair");
  assert.equal(pair.bonusMultiplier, 2);
});

test("flush engine uses the reduced one and a half multiplier", () => {
  const result = scorePlay(cards(["2S", "5S", "7S", "9S", "JS"]), { kind: "flush-mult", amount: 1.5 });
  assert.equal(result.handId, "flush");
  assert.equal(result.baseMultiplier, 6);
  assert.equal(result.bonusMultiplier, 1.5);
  assert.equal(result.multiplier, 7.5);
});

test("specific interaction effects use their new balance rules", () => {
  const baseCards = cards(["2S", "5H", "7D", "9C", "JS"]);
  const cases = [
    { kind: "pattern-reproduction", chips: 11, bonusMultiplier: 2.5, multiplier: 3.5 },
    { kind: "shadow-swap", chips: 16, bonusMultiplier: 1, multiplier: 2 },
    { kind: "void-erosion", chips: 16, bonusMultiplier: 1, multiplier: 2 },
    { kind: "world-mirror", chips: 17, bonusMultiplier: 2, multiplier: 3 },
    { kind: "man-mirror", chips: 17, bonusMultiplier: 2, multiplier: 3 },
    { kind: "shadow-targeting", gainedChipBonus: 27, chips: 38, bonusMultiplier: 1, multiplier: 2 },
    { kind: "chaos-dice", rerolledCardCount: 9, chips: 15.5, bonusMultiplier: 1, multiplier: 2 },
    { kind: "draven", chips: 11, bonusMultiplier: 3.5, multiplier: 4.5 },
    { kind: "tomato-king", tomatoHits: 6, chips: 41, bonusMultiplier: 1, multiplier: 2 },
    { kind: "tomato-shooter", tomatoThrows: 5, chips: 36, bonusMultiplier: 1, multiplier: 2 },
    { kind: "bite-me", discardMultiplier: 3, chips: 11, bonusMultiplier: 3, multiplier: 4 },
    { kind: "protoceratops", chips: 11, bonusMultiplier: 3, multiplier: 4 }
  ];

  for (const entry of cases) {
    const result = scorePlay(baseCards, entry);
    assert.equal(result.handId, "high-card");
    assert.equal(result.chips, entry.chips);
    assert.equal(result.bonusMultiplier, entry.bonusMultiplier);
    assert.equal(result.multiplier, entry.multiplier);
  }
});

test("effect option generation can exclude once-per-game effects", () => {
  for (let index = 0; index < 30; index += 1) {
    const excludedKinds = [
      "tomato-king",
      "tomato-shooter",
      "change-straight",
      "protoceratops",
      "bread-butter",
      "bread-cheese",
      "bread-jam",
      "astral-body",
      "tempered-tomato",
      "returning-fundamentals",
      "draw-sword",
      "critical-hit",
      "infinity-edge",
      "giant-killer",
      "matthew-effect",
      "critical-switch-hand",
      "dance-illusions"
    ];
    const options = createEffectOptions({ excludedKinds });
    assert.equal(options.some((effect) => excludedKinds.includes(effect.kind)), false);
    assert.equal(options.length, 3);
  }
});

test("returning and sword effects are limited to rounds two and three", () => {
  for (let index = 0; index < 50; index += 1) {
    const options = createEffectOptions({ round: 4 });
    assert.equal(options.some((effect) => ["returning-fundamentals", "draw-sword"].includes(effect.kind)), false);
    assert.equal(options.length, 3);
  }
});

test("new persistent and late-game score battle effects apply their scoring rules", () => {
  const high = cards(["2S", "5H", "7D", "9C", "JS"]);
  const straight = cards(["AS", "2H", "3D", "4C", "5S"]);
  const straightFlush = cards(["TH", "JH", "QH", "KH", "AH"]);

  const flushBoost = scorePlay(straightFlush, {
    kind: "straight-flush-boost"
  });
  assert.equal(flushBoost.chips, 61);
  assert.equal(flushBoost.multiplier, 15);
  assert.equal(flushBoost.score, 1915);

  const changedStraight = scorePlay(straight, { kind: "change-straight" });
  assert.equal(changedStraight.handId, "straight");
  assert.equal(changedStraight.multiplier, 15);
  assert.equal(changedStraight.score, 435);

  const breadJam = scorePlay(straight, null, { persistentEffects: { breadJam: true } });
  assert.equal(breadJam.chips, 32);
  assert.equal(breadJam.multiplier, 7);
  assert.equal(breadJam.score, 224);

  const breadCheese = scorePlay(cards(["4S", "4H", "4D", "8C", "9C"]), null, { persistentEffects: { breadCheese: true } });
  assert.equal(breadCheese.handId, "three-kind");
  assert.equal(breadCheese.chips, 24);
  assert.equal(breadCheese.multiplier, 5);

  const breadButter = scorePlay(cards(["4S", "4H", "7D", "7C", "9C"]), null, { persistentEffects: { breadButter: true } });
  assert.equal(breadButter.handId, "two-pair");
  assert.equal(breadButter.chips, 27);
  assert.equal(breadButter.multiplier, 5);

  const astral = scorePlay(high, { kind: "astral-body" }, { persistentEffects: { astralBody: true } });
  assert.equal(astral.score, 1005);

  const tempered = scorePlay(high, null, {
    persistentEffects: { temperedTomato: true },
    tomatoCounts: { hitsTotal: 90, throwsTotal: 60 }
  });
  assert.equal(tempered.chips, 296);
  assert.equal(tempered.score, 296);

  const fundamentals = scorePlay(high, null, { round: 4, persistentEffects: { returningFundamentals: true } });
  assert.equal(fundamentals.chips, 26);
  assert.equal(fundamentals.multiplier, 2.5);
  assert.equal(fundamentals.score, 65);

  const sword = scorePlay(high, null, { round: 5, persistentEffects: { drawSword: true } });
  assert.equal(sword.chips, 26);
  assert.equal(sword.multiplier, 3);
  assert.equal(sword.score, 78);

  const criticalExpected = scorePlay(high, null, { persistentEffects: { criticalHit: true }, criticalExpected: true });
  assert.equal(criticalExpected.chips, 15.125);
  assert.equal(criticalExpected.score, 15);

  const criticalRolled = scorePlay(high, null, {
    persistentEffects: { criticalHit: true },
    criticalRolls: [true, false, true, false, true]
  });
  assert.equal(criticalRolled.chips, 19.25);
  assert.equal(criticalRolled.score, 19);
  assert.equal(criticalRolled.cardValues.filter((entry) => entry.bonuses.some((bonus) => bonus.kind === "critical-hit" && bonus.critical)).length, 1);

  const infinityExpected = scorePlay(high, null, { persistentEffects: { infinityEdge: true }, criticalExpected: true });
  assert.equal(infinityExpected.chips, 14.4375);
  assert.equal(infinityExpected.score, 14);

  const stackedCriticalExpected = scorePlay(high, null, { persistentEffects: { criticalHit: true, infinityEdge: true }, criticalExpected: true });
  assert.equal(stackedCriticalExpected.chips, 21.3125);
  assert.equal(stackedCriticalExpected.score, 21);

  const stackedCriticalRolled = scorePlay(high, null, {
    persistentEffects: { criticalHit: true, infinityEdge: true },
    criticalRolls: [true, false, true, false, true]
  });
  assert.equal(stackedCriticalRolled.chips, 24.75);
  assert.equal(stackedCriticalRolled.score, 24);

  const switchExpected = scorePlay(high, null, { persistentEffects: { criticalSwitchHand: true }, criticalExpected: true });
  assert.equal(switchExpected.chips, 13.0625);
  assert.equal(switchExpected.score, 13);

  const danceProfile = criticalProfileForEffects({ danceIllusions: true });
  assert.equal(danceProfile.chance, 0.25);
  assert.equal(danceProfile.multiplier, 1.75);

  const brutal = scorePlay(high, { kind: "brutal-force" });
  assert.equal(brutal.chips, 36);
  assert.equal(brutal.multiplier, 2);
  assert.equal(brutal.score, 72);

  const vigorous = scorePlay(high, { kind: "vigorous" });
  assert.equal(vigorous.chips, 16.5);
  assert.equal(vigorous.score, 16);
  assert.equal(vigorous.chipFactors[0].factor, 1.5);

  const refresher = scorePlay(high, { kind: "refresher-orb" });
  assert.equal(refresher.multiplier, 2);
  assert.equal(refresher.score, 22);

  const matthew = scorePlay(high, { kind: "matthew-effect" });
  assert.equal(matthew.multiplier, 3);
  assert.equal(matthew.score, 33);

  const giant = scorePlay(high, null, {
    persistentEffects: { giantKiller: true },
    totalScoreBeforeRound: 250,
    highestTotalScoreBeforeRound: 500
  });
  assert.equal(giant.scoreFactors[0].factor, 1.5);
  assert.equal(giant.score, 16);
});

test("void seal owner gains chips and multiplier for the sealed suit", () => {
  const result = scorePlay(cards(["2S", "3S", "4H", "4D", "9C"]), { kind: "void-suit", suit: "S", amount: 3 }, {
    seatId: "seat-a",
    roundEffects: [{ kind: "void-suit", suit: "S", amount: 3, sourceSeatId: "seat-a" }]
  });
  assert.equal(result.handId, "one-pair");
  assert.equal(result.chips, 16);
  assert.equal(result.bonusMultiplier, 1);
  assert.equal(result.multiplier, 3);
  assert.equal(result.score, 48);
  assert.equal(result.cardValues.filter((entry) => entry.code.endsWith("S")).every((entry) => entry.bonuses.some((bonus) => bonus.amount === 4)), true);
});

test("finds the best play while requiring a community card", () => {
  const hand = cards(["TH", "JH", "QH", "KH", "AH"]);
  const community = cards(["2C", "3D", "4S", "5C", "9D"]);
  const best = findBestPlay(hand, community, null, { requireCommunity: true });
  assert.equal(best.cards.some((card) => community.some((communityCard) => communityCard.code === card.code)), true);
  assert.notEqual(best.result.handId, "straight-flush");
});
