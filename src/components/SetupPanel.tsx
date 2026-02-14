import React, { FormEvent } from "react";
import { SetupState } from "../types";

interface SetupPanelProps {
  visible: boolean;
  setup: SetupState;
  setupPlayers: string[];
  setupHasDuplicates: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPlayerNameChange: (index: number, value: string) => void;
  onSetStartingDealer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
  onAddPlayer: () => void;
  onReset: () => void;
}

export default function SetupPanel({
  visible,
  setup,
  setupPlayers,
  setupHasDuplicates,
  onSubmit,
  onPlayerNameChange,
  onSetStartingDealer,
  onRemovePlayer,
  onAddPlayer,
  onReset,
}: SetupPanelProps): JSX.Element {
  return (
    <section className={`panel ${visible ? "" : "hidden"}`} id="setup-panel">
      <h2>Game Setup</h2>
      <form className="setup-stack" onSubmit={onSubmit}>
        <section className="setup-block">
          <h3>Players</h3>
          <div className="players-editor">
            {setup.players.map((player, index) => (
              <div key={`setup-player-${index}`} className="player-row">
                <input
                  id={index === 0 ? "player-name-0" : undefined}
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChange={(event) => onPlayerNameChange(index, event.target.value)}
                />
                <button
                  type="button"
                  className={`btn btn-inline btn-tag ${setup.startingDealer === player.trim() ? "is-active" : ""}`}
                  onClick={() => onSetStartingDealer(player.trim())}
                  disabled={!player.trim() || setupHasDuplicates}
                  aria-label={`Set ${player || `player ${index + 1}`} as starting dealer`}
                >
                  Dealer
                </button>
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
          {setupHasDuplicates && <small className="helper helper-error">Player names must be unique.</small>}
        </section>

        <div className="setup-actions">
          <button type="submit" className="btn btn-primary">
            Start New Game
          </button>
          <button type="button" className="btn btn-danger" onClick={onReset}>
            Clear Saved Game
          </button>
        </div>
      </form>
    </section>
  );
}
