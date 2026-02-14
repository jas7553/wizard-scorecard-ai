import React, { FormEvent, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HomePanel from "./components/HomePanel";
import RoundPanel from "./components/RoundPanel";
import RulesPanel from "./components/RulesPanel";
import ScoreSheetPanel from "./components/ScoreSheetPanel";
import SetupPanel from "./components/SetupPanel";
import { GameState, LeaderboardRow, RoundEntry, RoundPhase, ScreenMode, SetupState, TrumpChoice } from "./types";

const STORAGE_KEY = "wizard-scorepad-state-v1";
const SCREEN_MODE_KEY = "wizard-scorepad-screen-mode-v1";
const TRUMP_CHOICES: TrumpChoice[] = ["unset", "none", "hearts", "clubs", "diamonds", "spades"];
const CONFETTI_COLORS = ["#2fb86f", "#cd3838", "#5b6ee1", "#f5b321", "#7dd3fc", "#f6e38c"];

function isTrumpChoice(value: unknown): value is TrumpChoice {
  return typeof value === "string" && TRUMP_CHOICES.includes(value as TrumpChoice);
}

interface ConfettiPiece {
  left: string;
  delay: string;
  duration: string;
  color: string;
}

function buildConfettiPieces(seed: number): ConfettiPiece[] {
  return Array.from({ length: 28 }, (_, index) => ({
    left: `${(index * 3.6 + seed * 11) % 100}%`,
    delay: `${(index % 7) * 45}ms`,
    duration: `${2150 + (index % 6) * 220}ms`,
    color: CONFETTI_COLORS[(index + seed) % CONFETTI_COLORS.length],
  }));
}

function isRoundEntry(value: unknown): value is RoundEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RoundEntry>;
  const bidValid = candidate.bid === null || Number.isInteger(candidate.bid);
  const tricksValid = candidate.tricks === null || Number.isInteger(candidate.tricks);
  return bidValid && tricksValid && Number.isInteger(candidate.score);
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameState>;

  if (
    !Array.isArray(candidate.players) ||
    !candidate.players.every((player) => typeof player === "string") ||
    !Array.isArray(candidate.rounds) ||
    !candidate.rounds.every((round) => Number.isInteger(round) && round > 0) ||
    !Number.isInteger(candidate.currentRoundIndex) ||
    !Number.isInteger(candidate.startingDealerIndex) ||
    !Array.isArray(candidate.roundPhases) ||
    !candidate.roundPhases.every((phase) => phase === "bidding" || phase === "tricks" || phase === "complete") ||
    !Array.isArray(candidate.roundTrump) ||
    !candidate.roundTrump.every(isTrumpChoice) ||
    !Array.isArray(candidate.entries) ||
    !candidate.entries.every((roundEntries) => Array.isArray(roundEntries) && roundEntries.every(isRoundEntry))
  ) {
    return false;
  }

  return (
    candidate.entries.length === candidate.rounds.length &&
    candidate.roundPhases.length === candidate.rounds.length &&
    candidate.roundTrump.length === candidate.rounds.length
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
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LegacyGameState>;
  if (
    !Array.isArray(candidate.players) ||
    !candidate.players.every((player) => typeof player === "string") ||
    !Array.isArray(candidate.rounds) ||
    !candidate.rounds.every((round) => Number.isInteger(round) && round > 0) ||
    !Number.isInteger(candidate.currentRoundIndex) ||
    !Number.isInteger(candidate.startingDealerIndex) ||
    !Array.isArray(candidate.entries) ||
    !candidate.entries.every((roundEntries) => Array.isArray(roundEntries) && roundEntries.every(isRoundEntry))
  ) {
    return false;
  }
  return candidate.entries.length === candidate.rounds.length;
}

function deriveRoundPhases(entries: RoundEntry[][]): RoundPhase[] {
  return entries.map((roundEntries) => {
    const hasAllBids = roundEntries.every((entry) => Number.isInteger(entry.bid));
    const hasAllTricks = roundEntries.every((entry) => Number.isInteger(entry.tricks));
    if (hasAllBids && hasAllTricks) {
      return "complete";
    }
    if (hasAllBids) {
      return "tricks";
    }
    return "bidding";
  });
}

function computeRoundScore(bid: number, tricks: number): number {
  if (bid === tricks) {
    return 20 + bid * 10;
  }
  return Math.abs(bid - tricks) * -10;
}

function normalizePlayerInputs(players: string[]): string[] {
  return players
    .map((player) => player.trim())
    .filter((player) => player.length > 0);
}

function hasDuplicatePlayers(players: string[]): boolean {
  const normalized = players.map((player) => player.toLocaleLowerCase());
  return new Set(normalized).size !== normalized.length;
}

function roundsForPlayerCount(playerCount: number): number[] {
  const roundsByPlayerCount: Record<number, number> = {
    3: 20,
    4: 15,
    5: 12,
    6: 10,
  };
  const totalRounds = roundsByPlayerCount[playerCount];
  return Array.from({ length: totalRounds }, (_, index) => index + 1);
}

function emptyRound(playerCount: number): RoundEntry[] {
  return Array.from({ length: playerCount }, () => ({ bid: null, tricks: null, score: 0 }));
}

function loadState(): GameState | null {
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    const parsed: unknown = JSON.parse(data);
    if (!isGameState(parsed)) {
      if (isLegacyGameState(parsed)) {
        const migratedPhases =
          Array.isArray(parsed.roundPhases) && parsed.roundPhases.length === parsed.rounds.length
            ? parsed.roundPhases
            : deriveRoundPhases(parsed.entries);
        return {
          ...parsed,
          roundPhases: migratedPhases,
          roundTrump: parsed.rounds.map((_, index) => (index === parsed.rounds.length - 1 ? "none" : "unset")),
        };
      }
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: GameState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadScreenMode(): ScreenMode | null {
  try {
    const value = window.localStorage.getItem(SCREEN_MODE_KEY);
    if (value === "home" || value === "setup" || value === "game" || value === "rules") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

function saveScreenMode(mode: ScreenMode): void {
  window.localStorage.setItem(SCREEN_MODE_KEY, mode);
}

function clearSavedState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

function playerTotals(state: GameState): number[] {
  return state.players.map((_, playerIndex) => state.entries.reduce((sum, round) => sum + round[playerIndex].score, 0));
}

function validateBids(state: GameState, roundIndex: number): string {
  const entries = state.entries[roundIndex];
  const cards = state.rounds[roundIndex];

  const incomplete = entries.some((entry) => !Number.isInteger(entry.bid));
  if (incomplete) {
    return "Fill in all bids before submitting bids.";
  }

  const outOfBounds = entries.some((entry) => entry.bid !== null && (entry.bid < 0 || entry.bid > cards));
  if (outOfBounds) {
    return `Bids must be between 0 and ${cards}.`;
  }

  return "";
}

function validateTricks(state: GameState, roundIndex: number): string {
  const entries = state.entries[roundIndex];
  const cards = state.rounds[roundIndex];

  const missingBids = entries.some((entry) => !Number.isInteger(entry.bid));
  if (missingBids) {
    return "Submit bids before entering tricks won.";
  }

  const incomplete = entries.some((entry) => !Number.isInteger(entry.tricks));
  if (incomplete) {
    return "Fill in all tricks won before saving the round.";
  }

  const outOfBounds = entries.some((entry) => entry.tricks !== null && (entry.tricks < 0 || entry.tricks > cards));
  if (outOfBounds) {
    return `Tricks won must be between 0 and ${cards}.`;
  }

  const tricksSum = entries.reduce((acc, entry) => acc + (entry.tricks ?? 0), 0);
  if (tricksSum !== cards) {
    return `Tricks total must equal ${cards}. Current total is ${tricksSum}.`;
  }

  return "";
}

export default function App(): JSX.Element {
  const initialState = useMemo(() => loadState(), []);

  const [setup, setSetup] = useState<SetupState>({
    players: ["", "", ""],
    startingDealer: "",
  });
  const [state, setState] = useState<GameState | null>(initialState);
  const [screenMode, setScreenMode] = useState<ScreenMode>(() => {
    const savedScreen = loadScreenMode();
    if (savedScreen === "game" && !initialState) {
      return "home";
    }
    return savedScreen ?? (initialState ? "home" : "setup");
  });
  const [roundWarning, setRoundWarning] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [confettiSeed, setConfettiSeed] = useState<number>(0);

  const hasGame = Boolean(state);
  const setupPlayers = useMemo(() => normalizePlayerInputs(setup.players), [setup.players]);
  const setupHasDuplicates = useMemo(() => hasDuplicatePlayers(setupPlayers), [setupPlayers]);

  useEffect(() => {
    if (!setupPlayers.length || setupHasDuplicates) {
      if (setup.startingDealer !== "") {
        setSetup((prev) => ({ ...prev, startingDealer: "" }));
      }
      return;
    }

    if (!setupPlayers.includes(setup.startingDealer)) {
      setSetup((prev) => ({ ...prev, startingDealer: setupPlayers[0] }));
    }
  }, [setupPlayers, setup.startingDealer, setupHasDuplicates]);

  useEffect(() => {
    saveScreenMode(screenMode);
  }, [screenMode]);

  const leaderboard = useMemo<LeaderboardRow[]>(() => {
    if (!state) {
      return [];
    }

    const totals = playerTotals(state);
    return state.players
      .map((name, index) => ({ name, total: totals[index] }))
      .sort((a, b) => b.total - a.total);
  }, [state]);

  const totalsByPlayer = useMemo<number[]>(() => (state ? playerTotals(state) : []), [state]);
  const gameIsComplete = useMemo<boolean>(() => (state ? state.roundPhases.every((phase) => phase === "complete") : false), [state]);
  const confettiPieces = useMemo<ConfettiPiece[]>(() => buildConfettiPieces(confettiSeed), [confettiSeed]);
  const winnerNames = useMemo<string[]>(() => {
    if (!state || totalsByPlayer.length === 0) {
      return [];
    }
    const maxScore = Math.max(...totalsByPlayer);
    return state.players.filter((_, index) => totalsByPlayer[index] === maxScore);
  }, [state, totalsByPlayer]);

  function updateGame(nextState: GameState): void {
    setState(nextState);
    saveState(nextState);
  }

  useEffect(() => {
    if (!showConfetti) {
      return;
    }
    const timeoutId = window.setTimeout(() => setShowConfetti(false), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [showConfetti, confettiSeed]);

  function triggerConfetti(): void {
    setConfettiSeed((previous) => previous + 1);
    setShowConfetti(true);
  }

  function handleStartGame(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const players = normalizePlayerInputs(setup.players);

    if (players.length < 3 || players.length > 6) {
      window.alert("Please enter between 3 and 6 unique player names.");
      return;
    }
    if (hasDuplicatePlayers(players)) {
      window.alert("Player names must be unique.");
      return;
    }

    const rounds = roundsForPlayerCount(players.length);

    const game: GameState = {
      players,
      rounds,
      currentRoundIndex: 0,
      startingDealerIndex: Math.max(0, players.indexOf(setup.startingDealer)),
      roundPhases: rounds.map(() => "bidding"),
      roundTrump: rounds.map((_, index) => (index === rounds.length - 1 ? "none" : "unset")),
      entries: rounds.map(() => emptyRound(players.length)),
    };

    updateGame(game);
    setRoundWarning("");
    setScreenMode("game");
  }

  function handlePlayerNameChange(index: number, value: string): void {
    setSetup((prev) => {
      const nextPlayers = [...prev.players];
      nextPlayers[index] = value;
      return { ...prev, players: nextPlayers };
    });
  }

  function handleSetStartingDealer(name: string): void {
    setSetup((prev) => ({ ...prev, startingDealer: name }));
  }

  function handleAddPlayerField(): void {
    setSetup((prev) => {
      if (prev.players.length >= 6) {
        return prev;
      }
      return { ...prev, players: [...prev.players, ""] };
    });
  }

  function handleRemovePlayerField(index: number): void {
    setSetup((prev) => {
      if (prev.players.length <= 1) {
        return prev;
      }
      return { ...prev, players: prev.players.filter((_, currentIndex) => currentIndex !== index) };
    });
  }

  function handleReset(): void {
    clearSavedState();
    setState(null);
    setRoundWarning("");
    setScreenMode("setup");
    window.alert("Saved game cleared.");
  }

  function handleGoHome(): void {
    setScreenMode("home");
  }

  function handleOpenRules(): void {
    setScreenMode("rules");
  }

  function handleContinueGame(): void {
    if (!state) {
      return;
    }
    setScreenMode("game");
  }

  function handleStartNewGameFromHome(): void {
    if (state) {
      const confirmed = window.confirm("Start a new game and replace the current saved game?");
      if (!confirmed) {
        return;
      }
      clearSavedState();
      setState(null);
      setRoundWarning("");
    }
    setScreenMode("setup");
  }

  function handleScoreChange(playerIndex: number, key: "bid" | "tricks", value: string): void {
    if (!state) {
      return;
    }

    const roundIndex = state.currentRoundIndex;
    const parsed = value === "" ? null : Number(value);
    const isValidParsed = typeof parsed === "number" && Number.isInteger(parsed) && parsed >= 0;

    const next = structuredClone(state);
    next.entries[roundIndex][playerIndex][key] = isValidParsed ? parsed : null;

    const row = next.entries[roundIndex][playerIndex];
    if (typeof row.bid === "number" && typeof row.tricks === "number") {
      row.score = computeRoundScore(row.bid, row.tricks);
    } else {
      row.score = 0;
    }

    updateGame(next);
  }

  function handleTrumpChange(value: TrumpChoice): void {
    if (!state || !isTrumpChoice(value)) {
      return;
    }

    const roundIndex = state.currentRoundIndex;
    if (roundIndex === state.rounds.length - 1) {
      return;
    }
    const next = structuredClone(state);
    next.roundTrump[roundIndex] = value;
    updateGame(next);
  }

  function moveRound(direction: 1 | -1): void {
    if (!state) {
      return;
    }

    const next = structuredClone(state);
    next.currentRoundIndex += direction;
    updateGame(next);
    setRoundWarning("");
  }

  function handleEditPreviousRound(): void {
    if (!state) {
      return;
    }

    const next = structuredClone(state);
    const targetRoundIndex = next.currentRoundIndex;
    next.roundPhases[targetRoundIndex] = "tricks";
    updateGame(next);
    setRoundWarning("");
  }

  function handleRoundPrimaryAction(): void {
    if (!state) {
      return;
    }

    const currentPhase = state.roundPhases[state.currentRoundIndex];
    const error = currentPhase === "bidding" ? validateBids(state, state.currentRoundIndex) : validateTricks(state, state.currentRoundIndex);
    if (error) {
      setRoundWarning(error);
      return;
    }

    const next = structuredClone(state);
    if (currentPhase === "bidding") {
      next.roundPhases[next.currentRoundIndex] = "tricks";
      updateGame(next);
      setRoundWarning("");
      return;
    }

    next.roundPhases[next.currentRoundIndex] = "complete";

    if (next.currentRoundIndex < next.rounds.length - 1) {
      next.currentRoundIndex += 1;
      updateGame(next);
      setRoundWarning("");
      return;
    }

    updateGame(next);
    setRoundWarning("Game complete. Review the score sheet below.");
    triggerConfetti();
  }

  return (
    <>
      <div className="backdrop" />
      <div className={`confetti-layer ${showConfetti ? "is-active" : ""}`} aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <span
            key={`${confettiSeed}-${index}`}
            className="confetti-piece"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              backgroundColor: piece.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <main className="app">
        <AppHeader showHomeButton={screenMode === "game" || screenMode === "rules"} onGoHome={handleGoHome} />

        <HomePanel
          visible={screenMode === "home"}
          hasSavedGame={hasGame}
          onContinue={handleContinueGame}
          onStartNew={handleStartNewGameFromHome}
          onReadRules={handleOpenRules}
        />

        <RulesPanel visible={screenMode === "rules"} />

        <SetupPanel
          visible={screenMode === "setup"}
          setup={setup}
          setupPlayers={setupPlayers}
          setupHasDuplicates={setupHasDuplicates}
          onSubmit={handleStartGame}
          onPlayerNameChange={handlePlayerNameChange}
          onSetStartingDealer={handleSetStartingDealer}
          onRemovePlayer={handleRemovePlayerField}
          onAddPlayer={handleAddPlayerField}
          onReset={handleReset}
        />

        {state && (
          <>
            {gameIsComplete ? (
              <>
                <ScoreSheetPanel
                  visible={screenMode === "game"}
                  state={state}
                  totalsByPlayer={totalsByPlayer}
                  leaderboard={leaderboard}
                  isComplete={true}
                  winnerNames={winnerNames}
                  canEditPreviousRound={state.rounds.length > 0}
                  onEditPreviousRound={handleEditPreviousRound}
                />
              </>
            ) : (
              <>
                <RoundPanel
                  visible={screenMode === "game"}
                  state={state}
                  roundWarning={roundWarning}
                  onScoreChange={handleScoreChange}
                  onTrumpChange={handleTrumpChange}
                  onMoveRound={moveRound}
                  onPrimaryAction={handleRoundPrimaryAction}
                />
                <ScoreSheetPanel
                  visible={screenMode === "game"}
                  state={state}
                  totalsByPlayer={totalsByPlayer}
                  leaderboard={leaderboard}
                  isComplete={false}
                  winnerNames={winnerNames}
                  canEditPreviousRound={false}
                />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
