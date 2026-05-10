import { describe, expect, it } from "vitest";
import { computeRoundScore, validateBids, validateTricks, roundsForPlayerCount, emptyRound, playerTotals } from "./game";
import { GameState } from "./types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: ["Alice", "Bob", "Carol"],
    rounds: [3, 2, 1],
    currentRoundIndex: 0,
    startingDealerIndex: 0,
    roundPhases: ["bidding", "bidding", "bidding"],
    roundTrump: ["unset", "unset", "none"],
    entries: [
      [{ bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }],
      [{ bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }],
      [{ bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }],
    ],
    ...overrides,
  };
}

describe("computeRoundScore", () => {
  it("exact match: 20 + bid * 10", () => {
    expect(computeRoundScore(0, 0)).toBe(20);
    expect(computeRoundScore(3, 3)).toBe(50);
    expect(computeRoundScore(5, 5)).toBe(70);
  });

  it("miss: |bid - tricks| * -10", () => {
    expect(computeRoundScore(3, 1)).toBe(-20);
    expect(computeRoundScore(0, 2)).toBe(-20);
    expect(computeRoundScore(4, 2)).toBe(-20);
  });
});

describe("validateBids", () => {
  it("returns empty string when all bids complete and in bounds", () => {
    const state = makeState({
      entries: [
        [{ bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateBids(state, 0)).toBe("");
  });

  it("errors when any bid is null", () => {
    expect(validateBids(makeState(), 0)).toBe("Fill in all bids before submitting bids.");
  });

  it("errors when bid exceeds card count", () => {
    const state = makeState({
      entries: [
        [{ bid: 4, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateBids(state, 0)).toBe("Bids must be between 0 and 3.");
  });

  it("errors when bid is negative", () => {
    const state = makeState({
      entries: [
        [{ bid: -1, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateBids(state, 0)).toBe("Bids must be between 0 and 3.");
  });
});

describe("validateTricks", () => {
  it("returns empty string when tricks sum equals card count", () => {
    const state = makeState({
      entries: [
        [{ bid: 1, tricks: 1, score: 0 }, { bid: 1, tricks: 1, score: 0 }, { bid: 1, tricks: 1, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateTricks(state, 0)).toBe("");
  });

  it("errors when bids not yet submitted", () => {
    expect(validateTricks(makeState(), 0)).toBe("Submit bids before entering tricks won.");
  });

  it("errors when any tricks is null", () => {
    const state = makeState({
      entries: [
        [{ bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateTricks(state, 0)).toBe("Fill in all tricks won before saving the round.");
  });

  it("errors when tricks sum does not equal card count", () => {
    const state = makeState({
      entries: [
        [{ bid: 1, tricks: 2, score: 0 }, { bid: 1, tricks: 0, score: 0 }, { bid: 1, tricks: 0, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateTricks(state, 0)).toBe("Tricks total must equal 3. Current total is 2.");
  });

  it("errors when tricks out of bounds", () => {
    const state = makeState({
      entries: [
        [{ bid: 1, tricks: 4, score: 0 }, { bid: 1, tricks: 0, score: 0 }, { bid: 1, tricks: 0, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    expect(validateTricks(state, 0)).toBe("Tricks won must be between 0 and 3.");
  });
});

describe("roundsForPlayerCount", () => {
  it.each([
    [3, 20],
    [4, 15],
    [5, 12],
    [6, 10],
  ])("%i players → %i rounds", (players, totalRounds) => {
    const rounds = roundsForPlayerCount(players);
    expect(rounds).toHaveLength(totalRounds);
    expect(rounds[0]).toBe(1);
    expect(rounds[totalRounds - 1]).toBe(totalRounds);
  });
});

describe("emptyRound", () => {
  it("returns N entries with null bid/tricks and score 0", () => {
    const round = emptyRound(4);
    expect(round).toHaveLength(4);
    round.forEach((entry) => {
      expect(entry.bid).toBeNull();
      expect(entry.tricks).toBeNull();
      expect(entry.score).toBe(0);
    });
  });
});

describe("playerTotals", () => {
  const scoredState = makeState({
    entries: [
      [{ bid: 1, tricks: 1, score: 30 }, { bid: 0, tricks: 1, score: -10 }, { bid: 2, tricks: 1, score: -10 }],
      [{ bid: 1, tricks: 0, score: -10 }, { bid: 1, tricks: 1, score: 30 }, { bid: 0, tricks: 1, score: -10 }],
      [{ bid: 0, tricks: 0, score: 20 }, { bid: 0, tricks: 0, score: 20 }, { bid: 1, tricks: 1, score: 30 }],
    ],
  });

  it("sums all rounds when upToRound omitted", () => {
    expect(playerTotals(scoredState)).toEqual([40, 40, 10]);
  });

  it("sums only rounds before upToRound", () => {
    expect(playerTotals(scoredState, 0)).toEqual([0, 0, 0]);
    expect(playerTotals(scoredState, 1)).toEqual([30, -10, -10]);
    expect(playerTotals(scoredState, 2)).toEqual([20, 20, -20]);
  });
});
