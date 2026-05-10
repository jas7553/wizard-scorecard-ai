import { computeRoundScore, emptyRound, roundsForPlayerCount, validateBids, validateTricks } from "./game";
import { GameState, RoundPhase, TrumpChoice } from "./types";

export type AdvancePhaseResult = { state: GameState; warning: string; gameComplete: boolean };

export function createGame(players: string[], startingDealerName: string): GameState {
  const rounds = roundsForPlayerCount(players.length);
  return {
    players,
    rounds,
    currentRoundIndex: 0,
    startingDealerIndex: Math.max(0, players.indexOf(startingDealerName)),
    roundPhases: rounds.map(() => "bidding"),
    roundTrump: rounds.map((_, i) => (i === rounds.length - 1 ? "none" : "unset")) as TrumpChoice[],
    entries: rounds.map(() => emptyRound(players.length)),
  };
}

export function advancePhase(state: GameState): AdvancePhaseResult {
  const { currentRoundIndex } = state;
  const currentPhase = state.roundPhases[currentRoundIndex];

  const error = currentPhase === "bidding"
    ? validateBids(state, currentRoundIndex)
    : validateTricks(state, currentRoundIndex);

  if (error) {
    return { state, warning: error, gameComplete: false };
  }

  const next = structuredClone(state);

  if (currentPhase === "bidding") {
    next.roundPhases[currentRoundIndex] = "tricks";
    return { state: next, warning: "", gameComplete: false };
  }

  next.roundPhases[currentRoundIndex] = "complete";
  const isLastRound = currentRoundIndex === state.rounds.length - 1;

  if (!isLastRound) {
    next.currentRoundIndex += 1;
    return { state: next, warning: "", gameComplete: false };
  }

  return { state: next, warning: "", gameComplete: true };
}

export function updateScore(state: GameState, playerIndex: number, key: "bid" | "tricks", value: string): GameState {
  const parsed = value === "" ? null : Number(value);
  const isValid = typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0;

  const next = structuredClone(state);
  const row = next.entries[state.currentRoundIndex][playerIndex];
  row[key] = isValid ? parsed : null;

  if (typeof row.bid === "number" && typeof row.tricks === "number") {
    row.score = computeRoundScore(row.bid, row.tricks);
  } else {
    row.score = 0;
  }

  return next;
}

export function updateTrump(state: GameState, value: TrumpChoice): GameState {
  if (state.currentRoundIndex === state.rounds.length - 1) {
    return state;
  }
  const next = structuredClone(state);
  next.roundTrump[state.currentRoundIndex] = value;
  return next;
}

export function moveRound(state: GameState, direction: 1 | -1): GameState {
  const next = structuredClone(state);
  next.currentRoundIndex += direction;
  return next;
}

export function editPreviousRound(state: GameState): GameState {
  const next = structuredClone(state);
  next.roundPhases[state.currentRoundIndex] = "tricks";
  return next;
}
