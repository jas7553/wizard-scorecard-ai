export type EntryKey = "bid" | "tricks";
export type RoundPhase = "bidding" | "results" | "complete";
export type ScreenMode = "home" | "setup" | "game" | "rules";
export type TrumpChoice = "unset" | "none" | "blue" | "green" | "red" | "yellow";

export interface RoundEntry {
  bid: number | null;
  tricks: number | null;
  score: number;
}

export interface GameState {
  players: string[];
  rounds: number[];
  currentRoundIndex: number;
  startingDealerIndex: number;
  roundPhases: RoundPhase[];
  roundTrump: TrumpChoice[];
  entries: RoundEntry[][];
}

export interface SetupState {
  players: string[];
  startingDealer: string;
}

export interface StandingsRow {
  name: string;
  total: number;
}
