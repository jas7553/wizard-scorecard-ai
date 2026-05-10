import React from "react";
import { EntryKey, GameState, RoundPhase, TrumpChoice } from "../types";

interface RoundPanelProps {
  visible: boolean;
  state: GameState;
  roundWarning: string;
  onScoreChange: (playerIndex: number, key: EntryKey, value: string) => void;
  onAdjustScore: (playerIndex: number, key: EntryKey, delta: 1 | -1) => void;
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

function phaseHeading(phase: RoundPhase): string {
  switch (phase) {
    case "tricks":
      return "Record tricks won";
    case "complete":
      return "Round complete";
    default:
      return "Enter bids";
  }
}

export default function RoundPanel({
  visible,
  state,
  roundWarning,
  onScoreChange,
  onAdjustScore,
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
  const bidsEnteredCount = roundEntries.filter((entry) => Number.isInteger(entry.bid)).length;
  const tricksEnteredCount = roundEntries.filter((entry) => Number.isInteger(entry.tricks)).length;

  const dealerIndex = (state.startingDealerIndex + state.currentRoundIndex) % state.players.length;
  const isFinalRound = roundIndex === state.rounds.length - 1;
  const trump = state.roundTrump[roundIndex] ?? "unset";

  const primaryButtonLabel =
    currentRoundPhase === "bidding"
      ? "Submit Bids"
      : roundIndex === state.rounds.length - 1
        ? "Finish Game"
        : "Save Round";
  const progressCount = isBiddingPhase ? bidsEnteredCount : tricksEnteredCount;
  const progressTotal = roundEntries.length;
  const progressPercent = progressTotal === 0 ? 0 : (progressCount / progressTotal) * 100;

  return (
    <section className={`panel round-panel ${visible ? "" : "hidden"}`}>
      <div className={`round-phase-banner phase-${currentRoundPhase}`}>
        <div className="round-phase-copy">
          <div className="round-title-row">
            <h2>{`Round ${roundIndex + 1} of ${state.rounds.length}`}</h2>
            <span className={`round-phase-pill phase-${currentRoundPhase}`}>{phaseHeading(currentRoundPhase)}</span>
          </div>
        </div>
        <div className="round-phase-progress" aria-live="polite">
          <div className="round-progress-head">
            <span>{isBiddingPhase ? "Players ready" : "Entries complete"}</span>
            <strong>{`${progressCount}/${progressTotal}`}</strong>
          </div>
          <div className="round-progress-track" aria-hidden="true">
            <span className="round-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="round-progress-copy">
            {isBiddingPhase ? `Bid total: ${totalBidsThisRound}` : `${totalTricksEntered} of ${roundCards} tricks entered`}
          </p>
        </div>
      </div>

      <div className="round-header">
        <div className={`round-context phase-${currentRoundPhase}`}>
          <label className="round-context-item trump-control">
            <span>Trump</span>
            <div className={`trump-banner ${trump === "unset" ? "is-unset" : ""}`}>
              <span className="trump-symbol" aria-hidden="true">
                {trumpSymbol(trump)}
              </span>
              <select
                className="summary-select"
                value={trump}
                onChange={(event) => onTrumpChange(event.target.value as TrumpChoice)}
                disabled={isFinalRound}
                title={isFinalRound ? "Final round: no trump when all cards are dealt." : undefined}
                aria-label="Trump"
              >
                <option value="unset">Unset</option>
                <option value="none">No Trump</option>
                <option value="hearts">Hearts</option>
                <option value="clubs">Clubs</option>
                <option value="diamonds">Diamonds</option>
                <option value="spades">Spades</option>
              </select>
            </div>
          </label>
          <div className="round-context-item round-progress-summary">
            <span>{isBiddingPhase ? "Round bids" : "Trick total"}</span>
            <strong>{isBiddingPhase ? totalBidsThisRound : totalTricksEntered}</strong>
          </div>
          <div className="round-context-item round-progress-summary">
            <span>{isBiddingPhase ? "Target" : "Required total"}</span>
            <strong>{roundCards}</strong>
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

      <div className={`player-entry-list phase-${currentRoundPhase}`} aria-label={isBiddingPhase ? "Bid entry rows" : "Trick entry rows"}>
        {state.players.map((player, playerIndex) => {
          const entry = state.entries[roundIndex][playerIndex];
          const total = totalBeforeRound(state, playerIndex, roundIndex) + entry.score;
          const isDealer = playerIndex === dealerIndex;
          const hasRoundScore = Number.isInteger(entry.bid) && Number.isInteger(entry.tricks);
          const activeKey: EntryKey = isBiddingPhase ? "bid" : "tricks";
          const activeValue = isBiddingPhase ? entry.bid : entry.tricks;

          return (
            <article key={player} className={`player-entry-row ${isDealer ? "is-dealer" : ""}`}>
              <div className="player-entry-main">
                <h3 className="player-entry-name">
                  {player}
                  {isDealer && <span className="dealer-badge">Dealer</span>}
                </h3>
                <p className="player-entry-meta">
                  {isBiddingPhase ? "Enter bid" : `Bid locked: ${entry.bid ?? "-"}`}
                </p>
              </div>
              <div className="player-entry-input">
                <label className="entry-field">
                  <span>{isBiddingPhase ? "Bid" : "Tricks won"}</span>
                  <div className="score-control">
                    <button
                      type="button"
                      className="score-stepper"
                      onClick={() => onAdjustScore(playerIndex, activeKey, -1)}
                      aria-label={`Decrease ${isBiddingPhase ? "bid" : "tricks"} for ${player}`}
                    >
                      -
                    </button>
                    <input
                      className="score-input"
                      type="number"
                      min="0"
                      max={roundCards}
                      inputMode="numeric"
                      value={activeValue ?? ""}
                      onChange={(event) => onScoreChange(playerIndex, activeKey, event.target.value)}
                    />
                    <button
                      type="button"
                      className="score-stepper"
                      onClick={() => onAdjustScore(playerIndex, activeKey, 1)}
                      aria-label={`Increase ${isBiddingPhase ? "bid" : "tricks"} for ${player}`}
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>
              <div className="player-entry-score">
                <div className="score-stack score-stack-round">
                  <span>Round</span>
                  <strong className={hasRoundScore ? (entry.score >= 0 ? "positive" : "negative") : ""}>
                    {hasRoundScore ? entry.score : "--"}
                  </strong>
                </div>
                <div className="score-stack score-stack-total">
                  <span>Total</span>
                  <strong>{total}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {roundWarning && (
        <p className="warning" role="alert" aria-live="assertive">
          {roundWarning}
        </p>
      )}

      <div className="round-action-dock">
        <div className="round-actions">
          <button type="button" className="btn round-secondary-action" disabled={roundIndex === 0} onClick={() => onMoveRound(-1)}>
            Previous
          </button>
          <button type="button" className="btn btn-primary round-primary-action" onClick={onPrimaryAction}>
            {primaryButtonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
