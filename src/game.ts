import { GameState, RoundEntry, StandingsRow } from "./types";

export function computeRoundScore(bid: number, tricks: number): number {
  if (bid === tricks) {
    return 20 + bid * 10;
  }
  return Math.abs(bid - tricks) * -10;
}

export function validateBids(state: GameState, roundIndex: number): string {
  const entries = state.entries[roundIndex];
  const cards = state.rounds[roundIndex];

  if (entries.some((entry) => !Number.isInteger(entry.bid))) {
    return "Fill in all bids before submitting bids.";
  }
  if (entries.some((entry) => entry.bid !== null && (entry.bid < 0 || entry.bid > cards))) {
    return `Bids must be between 0 and ${cards}.`;
  }
  return "";
}

export function validateTricks(state: GameState, roundIndex: number): string {
  const entries = state.entries[roundIndex];
  const cards = state.rounds[roundIndex];

  if (entries.some((entry) => !Number.isInteger(entry.bid))) {
    return "Submit bids before entering tricks won.";
  }
  if (entries.some((entry) => !Number.isInteger(entry.tricks))) {
    return "Fill in all tricks won before saving the round.";
  }
  if (entries.some((entry) => entry.tricks !== null && (entry.tricks < 0 || entry.tricks > cards))) {
    return `Tricks won must be between 0 and ${cards}.`;
  }
  const tricksSum = entries.reduce((acc, entry) => acc + (entry.tricks ?? 0), 0);
  if (tricksSum !== cards) {
    return `Tricks total must equal ${cards}. Current total is ${tricksSum}.`;
  }
  return "";
}

export function roundsForPlayerCount(playerCount: number): number[] {
  const totalByCount: Record<number, number> = { 3: 20, 4: 15, 5: 12, 6: 10 };
  const total = totalByCount[playerCount];
  return Array.from({ length: total }, (_, i) => i + 1);
}

export function emptyRound(playerCount: number): RoundEntry[] {
  return Array.from({ length: playerCount }, () => ({ bid: null, tricks: null, score: 0 }));
}

export function playerTotals(state: GameState, upToRound?: number): number[] {
  const limit = upToRound ?? state.entries.length;
  return state.players.map((_, playerIndex) =>
    state.entries.slice(0, limit).reduce((sum, round) => sum + round[playerIndex].score, 0)
  );
}

export function isGameComplete(state: GameState): boolean {
  return state.roundPhases.every((p) => p === "complete");
}

export function buildStandings(state: GameState): StandingsRow[] {
  const totals = playerTotals(state);
  return state.players
    .map((name, i) => ({ name, total: totals[i] }))
    .sort((a, b) => b.total - a.total);
}
