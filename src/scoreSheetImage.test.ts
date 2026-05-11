// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { buildScoreSheetImage } from "./scoreSheetImage";
import type { GameState, LeaderboardRow } from "./types";

const mockCtx = {
  scale: () => {},
  fillRect: () => {},
  fillText: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  arc: () => {},
  roundRect: () => {},
  fill: () => {},
  stroke: () => {},
  textBaseline: "middle" as CanvasTextBaseline,
  textAlign: "left" as CanvasTextAlign,
  fillStyle: "#000" as string | CanvasGradient | CanvasPattern,
  strokeStyle: "#000" as string | CanvasGradient | CanvasPattern,
  font: "",
  lineWidth: 1,
};

beforeAll(() => {
  (HTMLCanvasElement.prototype as { getContext: unknown }).getContext = () => mockCtx;
  HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback) {
    callback(new Blob(["img"], { type: "image/png" }));
  };
});

function makeState(playerCount: number, roundCount: number): GameState {
  const players = Array.from({ length: playerCount }, (_, i) => `P${i + 1}`);
  const rounds = Array.from({ length: roundCount }, (_, i) => i + 1);
  const entries = rounds.map(() =>
    players.map(() => ({ bid: 1, tricks: 1, score: 30 })),
  );
  return {
    players,
    rounds,
    currentRoundIndex: 0,
    startingDealerIndex: 0,
    roundPhases: rounds.map(() => "complete" as const),
    roundTrump: rounds.map(() => "blue" as const),
    entries,
  };
}

function makeLeaderboard(players: string[], totals: number[]): LeaderboardRow[] {
  return players
    .map((name, i) => ({ name, total: totals[i] }))
    .sort((a, b) => b.total - a.total);
}

describe("buildScoreSheetImage", () => {
  it("returns a Blob for a valid completed game", async () => {
    const state = makeState(3, 3);
    const totals = [90, 60, 30];
    const leaderboard = makeLeaderboard(state.players, totals);
    const result = await buildScoreSheetImage(state, totals, leaderboard, ["P1"]);
    expect(result).toBeInstanceOf(Blob);
  });

  it("does not throw for minimal input — 1 player, 1 round", async () => {
    const state = makeState(1, 1);
    const totals = [30];
    const leaderboard = makeLeaderboard(state.players, totals);
    await expect(buildScoreSheetImage(state, totals, leaderboard, ["P1"])).resolves.toBeInstanceOf(Blob);
  });

  it("does not throw for maximal input — 6 players, 20 rounds", async () => {
    const state = makeState(6, 20);
    const totals = [600, 500, 400, 300, 200, 100];
    const leaderboard = makeLeaderboard(state.players, totals);
    await expect(buildScoreSheetImage(state, totals, leaderboard, ["P1"])).resolves.toBeInstanceOf(Blob);
  });
});
