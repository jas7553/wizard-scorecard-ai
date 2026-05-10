import React, { FormEvent } from "react";
import { SetupState } from "../types";

interface SetupPanelProps {
  visible: boolean;
  setup: SetupState;
  setupPlayers: string[];
  setupHasDuplicates: boolean;
  setupError: string;
  setupNotice: string;
  hasSavedGame: boolean;
  confirmClearSavedGame: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPlayerNameChange: (index: number, value: string) => void;
  onSetStartingDealer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
  onAddPlayer: () => void;
  onReset: () => void;
  onCancelReset: () => void;
}

export default function SetupPanel({
  visible,
  setup,
  setupPlayers,
  setupHasDuplicates,
  setupError,
  setupNotice,
  hasSavedGame,
  confirmClearSavedGame,
  onSubmit,
  onPlayerNameChange,
  onSetStartingDealer,
  onRemovePlayer,
  onAddPlayer,
  onReset,
  onCancelReset,
}: SetupPanelProps): JSX.Element {
  const playerCount = setupPlayers.length;
  const roundCount = playerCount >= 3 && playerCount <= 6 ? { 3: 20, 4: 15, 5: 12, 6: 10 }[playerCount] : null;

  return (
    <section className={`panel ${visible ? "" : "hidden"}`} id="setup-panel">
      <div className="setup-head">
        <div>
          <p className="eyebrow">New Game</p>
          <h2>Set the table once</h2>
          <p className="helper">Enter 3 to 6 unique player names, then choose who deals first. The rest of the game flow is automatic.</p>
        </div>
        <div className="setup-summary">
          <div className="setup-summary-stat">
            <span>Players</span>
            <strong>{playerCount}</strong>
          </div>
          <div className="setup-summary-stat">
            <span>Rounds</span>
            <strong>{roundCount ?? "--"}</strong>
          </div>
        </div>
      </div>
      <form className="setup-stack" onSubmit={onSubmit}>
        <section className="setup-block">
          <h3>Players</h3>
          <p className="helper">Use short, readable names so players can scan the table quickly during live play.</p>
          <div className="players-editor">
            {setup.players.map((player, index) => (
              <div key={`setup-player-${index}`} className="player-row">
                <div className="field">
                  <label htmlFor={`player-name-${index}`}>{`Player ${index + 1}`}</label>
                  <input
                    id={`player-name-${index}`}
                    type="text"
                    placeholder={`Player ${index + 1}`}
                    value={player}
                    onChange={(event) => onPlayerNameChange(index, event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-inline btn-danger"
                  onClick={() => onRemovePlayer(index)}
                  disabled={setup.players.length === 1}
                  aria-label={`Remove player ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="players-editor-actions">
            <button type="button" className="btn btn-inline" onClick={onAddPlayer} disabled={setup.players.length >= 6}>
              Add Player
            </button>
            <small className="helper">{`Players entered: ${setupPlayers.length} / 6 (need 3-6)`}</small>
          </div>
          {setupHasDuplicates && <small className="helper helper-error">Player names must be unique before the game can start.</small>}
        </section>

        <section className="setup-block">
          <h3>Starting Dealer</h3>
          <p className="helper">Choose the player who will deal the first round. Dealer rotation continues automatically after that.</p>
          <div className="dealer-picker" role="radiogroup" aria-label="Starting dealer">
            {setupPlayers.length > 0 ? (
              setupPlayers.map((player) => (
                <button
                  key={`dealer-option-${player}`}
                  type="button"
                  className={`dealer-option ${setup.startingDealer === player ? "is-active" : ""}`}
                  onClick={() => onSetStartingDealer(player)}
                  disabled={setupHasDuplicates}
                  aria-pressed={setup.startingDealer === player}
                >
                  <span>{player}</span>
                  <strong>{setup.startingDealer === player ? "Selected" : "Choose"}</strong>
                </button>
              ))
            ) : (
              <p className="helper">Add player names first to unlock dealer selection.</p>
            )}
          </div>
        </section>

        <section className="setup-block setup-help-block">
          <h3>Before You Start</h3>
          <div className="quick-reference-grid">
            <article className="quick-reference-card">
              <strong>Official game length</strong>
              <span>{roundCount ? `${playerCount} players means ${roundCount} rounds.` : "Round count appears automatically once the player count is valid."}</span>
            </article>
            <article className="quick-reference-card">
              <strong>Readable names win</strong>
              <span>Use names players can recognize at a glance from around the table.</span>
            </article>
            <article className="quick-reference-card">
              <strong>Dealer order</strong>
              <span>The app rotates the dealer every round after the starting dealer you pick here.</span>
            </article>
          </div>
        </section>

        {(setupError || setupNotice) && (
          <div
            className={`inline-callout ${setupError ? "inline-callout-error" : "inline-callout-success"}`}
            role={setupError ? "alert" : "status"}
            aria-live={setupError ? "assertive" : "polite"}
          >
            <p>{setupError || setupNotice}</p>
          </div>
        )}

        <div className="setup-actions">
          <button type="submit" className="btn btn-primary">
            Start New Game
          </button>
          {hasSavedGame && (
            <button type="button" className="btn btn-danger" onClick={onReset}>
              Clear Saved Game
            </button>
          )}
        </div>

        {hasSavedGame && confirmClearSavedGame && (
          <div className="inline-callout inline-callout-warning" role="alert" aria-live="assertive">
            <p>Clear the saved game from this device? This removes the current in-progress table.</p>
            <div className="inline-callout-actions">
              <button type="button" className="btn btn-danger" onClick={onReset}>
                Confirm Clear
              </button>
              <button type="button" className="btn btn-subtle" onClick={onCancelReset}>
                Keep Saved Game
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
