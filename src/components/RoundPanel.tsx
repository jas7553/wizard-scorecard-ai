import React from "react";
import { EntryKey, GameState, RoundPhase, TrumpChoice } from "../types";

interface RoundPanelProps {
  visible: boolean;
  state: GameState;
  roundWarning: string;
  onScoreChange: (playerIndex: number, key: EntryKey, value: string) => void;
  onTrumpChange: (value: TrumpChoice) => void;
  onMoveRound: (direction: 1 | -1) => void;
  onPrimaryAction: () => void;
}

function totalBeforeRound(state: GameState, playerIndex: number, roundIndex: number): number {
  let total = 0;
  for (let index = 0; index < roundIndex; index += 1) {
    total += state.entries[index][playerIndex].score;
  }
  return total;
}

function trumpLabel(choice: TrumpChoice): string {
  switch (choice) {
    case "hearts":
      return "Hearts";
    case "clubs":
      return "Clubs";
    case "diamonds":
      return "Diamonds";
    case "spades":
      return "Spades";
    case "none":
      return "No Trump";
    default:
      return "Unset";
  }
}

function trumpSymbol(choice: TrumpChoice): string {
  switch (choice) {
    case "hearts":
      return "♥";
    case "clubs":
      return "♣";
    case "diamonds":
      return "♦";
    case "spades":
      return "♠";
    case "none":
      return "Ø";
    default:
      return "?";
  }
}

export default function RoundPanel({
  visible,
  state,
  roundWarning,
  onScoreChange,
  onTrumpChange,
  onMoveRound,
  onPrimaryAction,
}: RoundPanelProps): JSX.Element {
  const roundIndex = state.currentRoundIndex;
  const roundCards = state.rounds[roundIndex] ?? 0;
  const currentRoundPhase: RoundPhase = state.roundPhases[roundIndex] ?? "bidding";
  const isBiddingPhase = currentRoundPhase === "bidding";

  const roundEntries = state.entries[roundIndex] ?? [];
  const totalBidsThisRound = roundEntries.reduce((sum, entry) => sum + (entry.bid ?? 0), 0);
  const totalTricksEntered = roundEntries.reduce((sum, entry) => sum + (entry.tricks ?? 0), 0);
  const tricksEnteredCount = roundEntries.filter((entry) => Number.isInteger(entry.tricks)).length;

  const dealerIndex = (state.startingDealerIndex + state.currentRoundIndex) % state.players.length;
  const dealerName = state.players[dealerIndex] ?? "";
  const isFinalRound = roundIndex === state.rounds.length - 1;
  const trump = state.roundTrump[roundIndex] ?? "unset";

  const primaryButtonLabel =
    currentRoundPhase === "bidding"
      ? "Submit Bids"
      : roundIndex === state.rounds.length - 1
        ? "Finish Game"
        : "Save Round";

  return (
    <section className={`panel round-panel ${visible ? "" : "hidden"}`}>
      <div className="panel-head">
        <div>
          <div className="round-title-row">
            <h2>{`Round ${roundIndex + 1} of ${state.rounds.length}`}</h2>
            <div className={`trump-banner ${trump === "unset" ? "is-unset" : ""}`}>
              <span className="trump-symbol" aria-hidden="true">
                {trumpSymbol(trump)}
              </span>
              <span>{`Trump: ${trumpLabel(trump)}`}</span>
            </div>
          </div>
        </div>
        <div className="round-summary">
          <div className="summary-item">
            <span>Dealer</span>
            <strong>{dealerName || "-"}</strong>
          </div>
          <div className="summary-item">
            <span>Phase</span>
            <strong>{isBiddingPhase ? "Bidding" : "Play"}</strong>
          </div>
          <div className="summary-item">
            <span>Trump</span>
            <select
              className="summary-select"
              value={trump}
              onChange={(event) => onTrumpChange(event.target.value as TrumpChoice)}
              disabled={isFinalRound}
              title={isFinalRound ? "Final round: no trump when all cards are dealt." : undefined}
            >
              <option value="unset">Unset</option>
              <option value="none">None</option>
              <option value="hearts">Hearts</option>
              <option value="clubs">Clubs</option>
              <option value="diamonds">Diamonds</option>
              <option value="spades">Spades</option>
            </select>
          </div>
          <div className="summary-item">
            <span>{isBiddingPhase ? "Bids Total" : "Tricks Entered"}</span>
            <strong>{isBiddingPhase ? totalBidsThisRound : `${tricksEnteredCount}/${roundEntries.length} (${totalTricksEntered})`}</strong>
          </div>
        </div>
      </div>

      <div className={`bid-board ${currentRoundPhase === "bidding" ? "is-hidden" : ""}`}>
        {state.players.map((player, playerIndex) => (
          <div key={`bid-board-${player}`} className="bid-pill">
            <span>{player}</span>
            <strong>{state.entries[roundIndex][playerIndex].bid ?? "-"}</strong>
          </div>
        ))}
      </div>

      <div className="table-wrap desktop-only">
        <table className="round-entry-table">
          <colgroup>
            <col className="col-player" />
            <col className="col-bid" />
            <col className="col-tricks" />
            <col className="col-round-score" />
            <col className="col-total" />
          </colgroup>
          <thead>
            <tr>
              <th>Player</th>
              <th>Bid</th>
              <th>Tricks Won</th>
              <th>Round Score</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {state.players.map((player, playerIndex) => {
              const entry = state.entries[roundIndex][playerIndex];
              const total = totalBeforeRound(state, playerIndex, roundIndex) + entry.score;
              const isDealer = playerIndex === dealerIndex;
              return (
                <tr key={player} className={isDealer ? "dealer-row" : ""}>
                  <td>
                    <span>{player}</span>
                    {isDealer && <span className="dealer-badge">Dealer</span>}
                  </td>
                  <td>
                    {isBiddingPhase ? (
                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        max={roundCards}
                        inputMode="numeric"
                        value={entry.bid ?? ""}
                        onChange={(event) => onScoreChange(playerIndex, "bid", event.target.value)}
                      />
                    ) : (
                      <span className="locked-value">{entry.bid ?? "-"}</span>
                    )}
                  </td>
                  <td>
                    {isBiddingPhase ? (
                      <span className="pending-value">After bids</span>
                    ) : (
                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        max={roundCards}
                        inputMode="numeric"
                        value={entry.tricks ?? ""}
                        onChange={(event) => onScoreChange(playerIndex, "tricks", event.target.value)}
                      />
                    )}
                  </td>
                  <td className={entry.score >= 0 ? "positive" : "negative"}>
                    {Number.isInteger(entry.bid) && Number.isInteger(entry.tricks) ? entry.score : ""}
                  </td>
                  <td>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mobile-entry-list mobile-only">
        {state.players.map((player, playerIndex) => {
          const entry = state.entries[roundIndex][playerIndex];
          const total = totalBeforeRound(state, playerIndex, roundIndex) + entry.score;
          const isDealer = playerIndex === dealerIndex;
          return (
            <article key={player} className={`mobile-entry-card ${isDealer ? "dealer-card" : ""}`}>
              <div className="mobile-entry-head">
                <h3>
                  {player}
                  {isDealer && <span className="dealer-badge">Dealer</span>}
                </h3>
                <span className={entry.score >= 0 ? "positive" : "negative"}>{entry.score}</span>
              </div>
              <div className="mobile-entry-fields">
                {isBiddingPhase ? (
                  <label>
                    Bid
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      max={roundCards}
                      inputMode="numeric"
                      value={entry.bid ?? ""}
                      onChange={(event) => onScoreChange(playerIndex, "bid", event.target.value)}
                    />
                  </label>
                ) : (
                  <>
                    <p className="locked-bid">{`Bid: ${entry.bid ?? "-"}`}</p>
                    <label>
                      Tricks Won
                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        max={roundCards}
                        inputMode="numeric"
                        value={entry.tricks ?? ""}
                        onChange={(event) => onScoreChange(playerIndex, "tricks", event.target.value)}
                      />
                    </label>
                  </>
                )}
              </div>
              <p className="mobile-total">{`Total: ${total}`}</p>
            </article>
          );
        })}
      </div>

      <p className="warning">{roundWarning}</p>

      <div className="round-actions">
        <button type="button" className="btn" disabled={roundIndex === 0} onClick={() => onMoveRound(-1)}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={onPrimaryAction}>
          {primaryButtonLabel}
        </button>
      </div>
    </section>
  );
}
