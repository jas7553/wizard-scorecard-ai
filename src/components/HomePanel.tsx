import React from "react";
import { RoundPhase } from "../types";

interface SavedGameSummary {
  players: string[];
  currentRoundNumber: number;
  totalRounds: number;
  currentPhase: RoundPhase | null;
  isComplete: boolean;
}

interface HomePanelProps {
  visible: boolean;
  hasSavedGame: boolean;
  savedGameSummary: SavedGameSummary | null;
  confirmReplaceSavedGame: boolean;
  onContinue: () => void;
  onStartNew: () => void;
  onCancelStartNew: () => void;
  onReadRules: () => void;
}

function phaseLabel(phase: RoundPhase | null, isComplete: boolean): string {
  if (isComplete) {
    return "Final review";
  }
  if (phase === "tricks") {
    return "Trick entry";
  }
  if (phase === "complete") {
    return "Round complete";
  }
  return "Bidding";
}

export default function HomePanel({
  visible,
  hasSavedGame,
  savedGameSummary,
  confirmReplaceSavedGame,
  onContinue,
  onStartNew,
  onCancelStartNew,
  onReadRules,
}: HomePanelProps): JSX.Element {
  return (
    <section className={`panel ${visible ? "" : "hidden"}`} id="home-panel">
      <div className="home-hero">
        <div>
          <p className="eyebrow">Opening Flow</p>
          <h2>{hasSavedGame ? "Pick up where the table left off" : "Start a new Wizard table"}</h2>
          <p className="helper home-lead">
            {hasSavedGame
              ? "Resume the saved game immediately, or replace it with a fresh setup after confirming below."
              : "Move straight into setup with a clean table. Rules stay available as a secondary path."}
          </p>
        </div>
        <div className="home-actions home-actions-primary">
          <button type="button" className="btn btn-primary" onClick={hasSavedGame ? onContinue : onStartNew}>
            {hasSavedGame ? "Resume Saved Game" : "Start New Game"}
          </button>
          <button type="button" className="btn" onClick={onReadRules}>
            Quick Rules
          </button>
        </div>
      </div>

      {hasSavedGame && savedGameSummary && (
        <section className="home-saved-game">
          <div className="home-saved-copy">
            <p className="eyebrow">Saved Game</p>
            <h3>{savedGameSummary.isComplete ? "Completed table" : `Round ${savedGameSummary.currentRoundNumber} of ${savedGameSummary.totalRounds}`}</h3>
            <p className="helper">
              {`${savedGameSummary.players.length} players • ${phaseLabel(savedGameSummary.currentPhase, savedGameSummary.isComplete)}`}
            </p>
          </div>
          <div className="home-player-tags">
            {savedGameSummary.players.map((player) => (
              <span key={`saved-player-${player}`} className="home-player-tag">
                {player}
              </span>
            ))}
          </div>
          <div className="home-actions">
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              Continue Game
            </button>
            <button type="button" className="btn" onClick={onStartNew}>
              Replace With New Game
            </button>
          </div>
          {confirmReplaceSavedGame && (
            <div className="inline-callout inline-callout-warning" role="alert" aria-live="assertive">
              <p>Starting a new game will replace the current saved game.</p>
              <div className="inline-callout-actions">
                <button type="button" className="btn btn-primary" onClick={onStartNew}>
                  Confirm Replacement
                </button>
                <button type="button" className="btn btn-subtle" onClick={onCancelStartNew}>
                  Keep Saved Game
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
