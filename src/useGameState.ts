import { useState } from "react";
import { buildStandings, isGameComplete, playerTotals } from "./game";
import { advancePhase, createGame, editPreviousRound, moveRound, updateScore, updateTrump } from "./gameStateMachine";
import { GameState, RoundEntry, RoundPhase, StandingsRow, TrumpChoice } from "./types";

const STORAGE_KEY = "wizard-scorepad-state-v1";
const TRUMP_CHOICES: TrumpChoice[] = ["unset", "none", "blue", "green", "red", "yellow"];

function isTrumpChoice(value: unknown): value is TrumpChoice {
  return typeof value === "string" && TRUMP_CHOICES.includes(value as TrumpChoice);
}

function isRoundEntry(value: unknown): value is RoundEntry {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<RoundEntry>;
  return (
    (c.bid === null || Number.isInteger(c.bid)) &&
    (c.tricks === null || Number.isInteger(c.tricks)) &&
    Number.isInteger(c.score)
  );
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<GameState>;
  return (
    Array.isArray(c.players) &&
    c.players.every((p) => typeof p === "string") &&
    Array.isArray(c.rounds) &&
    c.rounds.every((r) => Number.isInteger(r) && r > 0) &&
    Number.isInteger(c.currentRoundIndex) &&
    Number.isInteger(c.startingDealerIndex) &&
    Array.isArray(c.roundPhases) &&
    c.roundPhases.every((p) => p === "bidding" || p === "results" || p === "complete") &&
    Array.isArray(c.roundTrump) &&
    c.roundTrump.every(isTrumpChoice) &&
    Array.isArray(c.entries) &&
    c.entries.every((r) => Array.isArray(r) && r.every(isRoundEntry)) &&
    c.entries.length === c.rounds.length &&
    c.roundPhases.length === c.rounds.length &&
    c.roundTrump.length === c.rounds.length
  );
}

interface LegacyGameState {
  players: string[];
  rounds: number[];
  currentRoundIndex: number;
  startingDealerIndex: number;
  roundPhases?: RoundPhase[];
  entries: RoundEntry[][];
}

function isLegacyGameState(value: unknown): value is LegacyGameState {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<LegacyGameState>;
  return (
    Array.isArray(c.players) &&
    c.players.every((p) => typeof p === "string") &&
    Array.isArray(c.rounds) &&
    c.rounds.every((r) => Number.isInteger(r) && r > 0) &&
    Number.isInteger(c.currentRoundIndex) &&
    Number.isInteger(c.startingDealerIndex) &&
    Array.isArray(c.entries) &&
    c.entries.every((r) => Array.isArray(r) && r.every(isRoundEntry)) &&
    c.entries.length === c.rounds.length
  );
}

function deriveRoundPhases(entries: RoundEntry[][]): RoundPhase[] {
  return entries.map((round) => {
    const allBids = round.every((e) => Number.isInteger(e.bid));
    const allTricks = round.every((e) => Number.isInteger(e.tricks));
    if (allBids && allTricks) return "complete";
    if (allBids) return "results";
    return "bidding";
  });
}

const SUIT_MIGRATION: Record<string, TrumpChoice> = {
  hearts: "blue",
  clubs: "green",
  diamonds: "red",
  spades: "yellow",
};

function migrateRawState(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = { ...(parsed as Record<string, unknown>) };
  if (Array.isArray(obj.roundTrump)) {
    obj.roundTrump = obj.roundTrump.map((t: unknown) =>
      typeof t === "string" && SUIT_MIGRATION[t] ? SUIT_MIGRATION[t] : t
    );
  }
  if (Array.isArray(obj.roundPhases)) {
    obj.roundPhases = obj.roundPhases.map((p: unknown) => (p === "tricks" ? "results" : p));
  }
  return obj;
}

function loadState(): GameState | null {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed: unknown = migrateRawState(JSON.parse(data));
    if (isGameState(parsed)) return parsed;
    if (isLegacyGameState(parsed)) {
      const phases =
        Array.isArray(parsed.roundPhases) && parsed.roundPhases.length === parsed.rounds.length
          ? parsed.roundPhases
          : deriveRoundPhases(parsed.entries);
      return {
        ...parsed,
        roundPhases: phases,
        roundTrump: parsed.rounds.map((_, i) => (i === parsed.rounds.length - 1 ? "none" : "unset")),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveState(state: GameState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearSavedState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

interface UseGameStateOptions {
  onGameComplete: () => void;
}

export interface UseGameStateResult {
  state: GameState | null;
  roundWarning: string;
  totalsByPlayer: number[];
  gameIsComplete: boolean;
  standings: StandingsRow[];
  startGame: (players: string[], startingDealerName: string) => void;
  resetGame: () => void;
  handleScoreChange: (playerIndex: number, key: "bid" | "tricks", value: string) => void;
  handleTrumpChange: (value: TrumpChoice) => void;
  handleAdvancePhase: () => void;
  handleMoveRound: (direction: 1 | -1) => void;
  handleEditPreviousRound: () => void;
}

export function useGameState({ onGameComplete }: UseGameStateOptions): UseGameStateResult {
  const [state, setState] = useState<GameState | null>(() => loadState());
  const [roundWarning, setRoundWarning] = useState<string>("");

  function persist(next: GameState): void {
    setState(next);
    saveState(next);
  }

  const totalsByPlayer = state ? playerTotals(state) : [];
  const gameIsComplete = state ? isGameComplete(state) : false;
  const standings = state ? buildStandings(state) : [];

  function startGame(players: string[], startingDealerName: string): void {
    const next = createGame(players, startingDealerName);
    persist(next);
    setRoundWarning("");
  }

  function resetGame(): void {
    clearSavedState();
    setState(null);
    setRoundWarning("");
  }

  function handleScoreChange(playerIndex: number, key: "bid" | "tricks", value: string): void {
    if (!state) return;
    persist(updateScore(state, playerIndex, key, value));
  }

  function handleTrumpChange(value: TrumpChoice): void {
    if (!state || !isTrumpChoice(value)) return;
    persist(updateTrump(state, value));
  }

  function handleAdvancePhase(): void {
    if (!state) return;
    const result = advancePhase(state);
    if (result.warning) {
      setRoundWarning(result.warning);
      return;
    }
    persist(result.state);
    if (result.gameComplete) {
      setRoundWarning("Game complete. Review the score sheet below.");
      onGameComplete();
    } else {
      setRoundWarning("");
    }
  }

  function handleMoveRound(direction: 1 | -1): void {
    if (!state) return;
    persist(moveRound(state, direction));
    setRoundWarning("");
  }

  function handleEditPreviousRound(): void {
    if (!state) return;
    persist(editPreviousRound(state));
    setRoundWarning("");
  }

  return {
    state,
    roundWarning,
    totalsByPlayer,
    gameIsComplete,
    standings,
    startGame,
    resetGame,
    handleScoreChange,
    handleTrumpChange,
    handleAdvancePhase,
    handleMoveRound,
    handleEditPreviousRound,
  };
}
