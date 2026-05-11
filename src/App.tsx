import React, { FormEvent, useEffect, useMemo, useState } from "react";
import AppHeader from "./components/AppHeader";
import HomePanel from "./components/HomePanel";
import RoundPanel from "./components/RoundPanel";
import RulesPanel from "./components/RulesPanel";
import ScoreSheetPanel from "./components/ScoreSheetPanel";
import SetupPanel from "./components/SetupPanel";
import { useGameState } from "./useGameState";
import { ScreenMode, SetupState } from "./types";

const SCREEN_MODE_KEY = "wizard-scorepad-screen-mode-v1";
const CONFETTI_COLORS = ["#2fb86f", "#cd3838", "#5b6ee1", "#f5b321", "#7dd3fc", "#f6e38c"];

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

function normalizePlayerInputs(players: string[]): string[] {
  return players.map((p) => p.trim()).filter((p) => p.length > 0);
}

function hasDuplicatePlayers(players: string[]): boolean {
  const normalized = players.map((p) => p.toLocaleLowerCase());
  return new Set(normalized).size !== normalized.length;
}

function loadScreenMode(): ScreenMode | null {
  try {
    const value = window.localStorage.getItem(SCREEN_MODE_KEY);
    if (value === "home" || value === "setup" || value === "game" || value === "rules") return value;
    return null;
  } catch {
    return null;
  }
}

function saveScreenMode(mode: ScreenMode): void {
  window.localStorage.setItem(SCREEN_MODE_KEY, mode);
}

export default function App(): JSX.Element {
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [confettiSeed, setConfettiSeed] = useState<number>(0);

  function triggerConfetti(): void {
    setConfettiSeed((prev) => prev + 1);
    setShowConfetti(true);
  }

  const game = useGameState({ onGameComplete: triggerConfetti });

  const [setup, setSetup] = useState<SetupState>({
    players: ["", "", ""],
    startingDealer: "",
  });

  const [screenMode, setScreenMode] = useState<ScreenMode>(() => {
    const saved = loadScreenMode();
    if (saved === "game" && !game.state) return "home";
    return saved ?? (game.state ? "home" : "setup");
  });

  const setupPlayers = useMemo(() => normalizePlayerInputs(setup.players), [setup.players]);
  const setupHasDuplicates = useMemo(() => hasDuplicatePlayers(setupPlayers), [setupPlayers]);

  useEffect(() => {
    if (!setupPlayers.length || setupHasDuplicates) {
      if (setup.startingDealer !== "") setSetup((prev) => ({ ...prev, startingDealer: "" }));
      return;
    }
    if (!setupPlayers.includes(setup.startingDealer)) {
      setSetup((prev) => ({ ...prev, startingDealer: setupPlayers[0] }));
    }
  }, [setupPlayers, setup.startingDealer, setupHasDuplicates]);

  useEffect(() => {
    saveScreenMode(screenMode);
  }, [screenMode]);

  useEffect(() => {
    if (!showConfetti) return;
    const id = window.setTimeout(() => setShowConfetti(false), 3600);
    return () => window.clearTimeout(id);
  }, [showConfetti, confettiSeed]);

  const confettiPieces = useMemo(() => buildConfettiPieces(confettiSeed), [confettiSeed]);

  const winnerNames = game.standings
    .filter((r) => r.total === game.standings[0]?.total)
    .map((r) => r.name);

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
    game.startGame(players, setup.startingDealer);
    setScreenMode("game");
  }

  function handleReset(): void {
    game.resetGame();
    setScreenMode("setup");
    window.alert("Saved game cleared.");
  }

  function handleStartNewGameFromHome(): void {
    if (game.state) {
      const confirmed = window.confirm("Start a new game and replace the current saved game?");
      if (!confirmed) return;
      game.resetGame();
    }
    setScreenMode("setup");
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
        <AppHeader
          showHomeButton={screenMode === "game" || screenMode === "rules"}
          onGoHome={() => setScreenMode("home")}
        />

        <HomePanel
          visible={screenMode === "home"}
          hasSavedGame={Boolean(game.state)}
          onContinue={() => setScreenMode("game")}
          onStartNew={handleStartNewGameFromHome}
          onReadRules={() => setScreenMode("rules")}
        />

        <RulesPanel visible={screenMode === "rules"} />

        <SetupPanel
          visible={screenMode === "setup"}
          setup={setup}
          setupPlayers={setupPlayers}
          setupHasDuplicates={setupHasDuplicates}
          onSubmit={handleStartGame}
          onPlayerNameChange={(index, value) =>
            setSetup((prev) => {
              const next = [...prev.players];
              next[index] = value;
              return { ...prev, players: next };
            })
          }
          onSetStartingDealer={(name) => setSetup((prev) => ({ ...prev, startingDealer: name }))}
          onRemovePlayer={(index) =>
            setSetup((prev) => {
              if (prev.players.length <= 1) return prev;
              return { ...prev, players: prev.players.filter((_, i) => i !== index) };
            })
          }
          onAddPlayer={() =>
            setSetup((prev) => {
              if (prev.players.length >= 6) return prev;
              return { ...prev, players: [...prev.players, ""] };
            })
          }
          onReset={handleReset}
        />

        {game.state && (
          <>
            {game.gameIsComplete ? (
              <ScoreSheetPanel
                visible={screenMode === "game"}
                state={game.state}
                totalsByPlayer={game.totalsByPlayer}
                standings={game.standings}
                isComplete={true}
                winnerNames={winnerNames}
                canEditPreviousRound={game.state.rounds.length > 0}
                onEditPreviousRound={game.handleEditPreviousRound}
              />
            ) : (
              <>
                <RoundPanel
                  visible={screenMode === "game"}
                  state={game.state}
                  roundWarning={game.roundWarning}
                  onScoreChange={game.handleScoreChange}
                  onTrumpChange={game.handleTrumpChange}
                  onMoveRound={game.handleMoveRound}
                  onPrimaryAction={game.handleAdvancePhase}
                />
                <ScoreSheetPanel
                  visible={screenMode === "game"}
                  state={game.state}
                  totalsByPlayer={game.totalsByPlayer}
                  standings={game.standings}
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
