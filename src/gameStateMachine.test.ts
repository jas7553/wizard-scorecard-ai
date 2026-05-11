import { describe, expect, it, vi } from "vitest";
import { createGame, advancePhase, updateScore, updateTrump, moveRound, editPreviousRound } from "./gameStateMachine";
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
      [{ bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }],
      [{ bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }],
      [{ bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }, { bid: null, tricks: null, score: 0 }],
    ],
    ...overrides,
  };
}

describe("createGame", () => {
  it("creates game with correct structure for 3 players", () => {
    const state = createGame(["Alice", "Bob", "Carol"], "Alice");

    expect(state.players).toEqual(["Alice", "Bob", "Carol"]);
    expect(state.rounds.length).toBe(20);
    expect(state.currentRoundIndex).toBe(0);
    expect(state.startingDealerIndex).toBe(0);
    expect(state.roundPhases).toHaveLength(20);
    expect(state.roundPhases.every((p) => p === "bidding")).toBe(true);
    expect(state.roundTrump[19]).toBe("none");
    expect(state.roundTrump.slice(0, 19).every((t) => t === "unset")).toBe(true);
    expect(state.entries).toHaveLength(20);
    expect(state.entries[0]).toHaveLength(3);
    expect(state.entries[0][0]).toEqual({ bid: null, tricks: null, score: 0 });
  });
});

describe("advancePhase", () => {
  it("valid bids: phase advances to results, no warning, not complete", () => {
    const state = makeState();
    const result = advancePhase(state);

    expect(result.state.roundPhases[0]).toBe("results");
    expect(result.warning).toBe("");
    expect(result.gameComplete).toBe(false);
  });

  it("invalid bids: warning set, phase unchanged, state unchanged", () => {
    const state = makeState({
      entries: [
        [{ bid: null, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    const result = advancePhase(state);

    expect(result.state.roundPhases[0]).toBe("bidding");
    expect(result.warning).not.toBe("");
    expect(result.gameComplete).toBe(false);
  });

  it("valid tricks mid-game: phase complete, index advances", () => {
    const state = makeState({
      roundPhases: ["results", "bidding", "bidding"],
      entries: [
        [{ bid: 1, tricks: 1, score: 0 }, { bid: 1, tricks: 1, score: 0 }, { bid: 1, tricks: 1, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    const result = advancePhase(state);

    expect(result.state.roundPhases[0]).toBe("complete");
    expect(result.state.currentRoundIndex).toBe(1);
    expect(result.warning).toBe("");
    expect(result.gameComplete).toBe(false);
  });

  it("valid tricks last round: gameComplete true", () => {
    const state = makeState({
      currentRoundIndex: 2,
      roundPhases: ["complete", "complete", "results"],
      entries: [
        makeState().entries[0],
        makeState().entries[1],
        [{ bid: 1, tricks: 1, score: 0 }, { bid: 0, tricks: 0, score: 0 }, { bid: 0, tricks: 0, score: 0 }],
      ],
    });
    const result = advancePhase(state);

    expect(result.state.roundPhases[2]).toBe("complete");
    expect(result.gameComplete).toBe(true);
    expect(result.warning).toBe("");
  });

  it("invalid tricks: warning set, phase unchanged", () => {
    const state = makeState({
      roundPhases: ["results", "bidding", "bidding"],
      entries: [
        [{ bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }],
        ...makeState().entries.slice(1),
      ],
    });
    const result = advancePhase(state);

    expect(result.state.roundPhases[0]).toBe("results");
    expect(result.warning).not.toBe("");
    expect(result.gameComplete).toBe(false);
  });
});

describe("updateScore", () => {
  it("sets bid and leaves score 0 when tricks still null", () => {
    const state = makeState();
    const next = updateScore(state, 0, "bid", "2");

    expect(next.entries[0][0].bid).toBe(2);
    expect(next.entries[0][0].score).toBe(0);
  });

  it("auto-computes score when both bid and tricks are set", () => {
    const state = makeState({ entries: [
      [{ bid: 2, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }],
      ...makeState().entries.slice(1),
    ]});
    const next = updateScore(state, 0, "tricks", "2");

    expect(next.entries[0][0].tricks).toBe(2);
    expect(next.entries[0][0].score).toBe(40); // exact match: 20 + 2*10
  });

  it("empty string sets value to null", () => {
    const state = makeState({ entries: [
      [{ bid: 2, tricks: null, score: 0 }, { bid: 1, tricks: null, score: 0 }, { bid: 0, tricks: null, score: 0 }],
      ...makeState().entries.slice(1),
    ]});
    const next = updateScore(state, 0, "bid", "");

    expect(next.entries[0][0].bid).toBeNull();
  });
});

describe("updateTrump", () => {
  it("updates trump for current round", () => {
    const state = makeState();
    const next = updateTrump(state, "blue");

    expect(next.roundTrump[0]).toBe("blue");
  });

  it("no-op on final round", () => {
    const state = makeState({ currentRoundIndex: 2 });
    const next = updateTrump(state, "blue");

    expect(next.roundTrump[2]).toBe("none");
  });
});

describe("moveRound", () => {
  it("advances index forward", () => {
    const state = makeState({ currentRoundIndex: 0 });
    const next = moveRound(state, 1);

    expect(next.currentRoundIndex).toBe(1);
  });

  it("moves index backward", () => {
    const state = makeState({ currentRoundIndex: 2 });
    const next = moveRound(state, -1);

    expect(next.currentRoundIndex).toBe(1);
  });
});

describe("editPreviousRound", () => {
  it("reverts current round phase from complete to results", () => {
    const state = makeState({ roundPhases: ["complete", "complete", "complete"], currentRoundIndex: 2 });
    const next = editPreviousRound(state);

    expect(next.roundPhases[2]).toBe("results");
  });
});
