import React, { useState } from "react";
import { GameState, LeaderboardRow } from "../types";
import { buildScoreSheetImage } from "../scoreSheetImage";

interface ScoreSheetPanelProps {
  visible: boolean;
  state: GameState;
  totalsByPlayer: number[];
  leaderboard: LeaderboardRow[];
  isComplete: boolean;
  winnerNames: string[];
  canEditPreviousRound: boolean;
  onEditPreviousRound?: () => void;
}

export default function ScoreSheetPanel({
  visible,
  state,
  totalsByPlayer,
  leaderboard,
  isComplete,
  winnerNames,
  canEditPreviousRound,
  onEditPreviousRound,
}: ScoreSheetPanelProps): JSX.Element {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string>("");

  const isWinner = (name: string): boolean => winnerNames.includes(name);
  const isShareReady = isComplete && visible;

  function renderScoreTable(): JSX.Element {
    return (
      <div className="scoresheet-wrap">
        <table className="scoresheet-table">
          <colgroup>
            <col className="round-col-width" />
            {state.players.map((player) => (
              <col key={`player-col-${player}`} className="sheet-player-col" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="round-col">*</th>
              {state.players.map((player) => (
                <th key={`head-${player}`} className={`player-head ${isWinner(player) ? "winner-col-head" : ""}`}>
                  {player}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rounds.map((_, currentRoundIndex) => (
              <tr key={`sheet-round-${currentRoundIndex + 1}`}>
                <td className="round-col">{currentRoundIndex + 1}</td>
                {state.players.map((player, playerIndex) => {
                  const entry = state.entries[currentRoundIndex][playerIndex];
                  const isDealer = (state.startingDealerIndex + currentRoundIndex) % state.players.length === playerIndex;
                  return (
                    <td key={`sheet-row-${currentRoundIndex}-${player}`} className="sheet-quick-cell">
                      <div className="quick-layout">
                        <div className="quick-score-pane">
                          <span className={`quick-score-value ${entry.score >= 0 ? "sheet-score positive" : "sheet-score negative"}`}>
                            {Number.isInteger(entry.bid) && Number.isInteger(entry.tricks) ? entry.score : ""}
                          </span>
                          <span
                            className={`dealer-dot ${isDealer ? "is-dealer" : ""}`}
                            aria-label={isDealer ? "Dealer" : "Not dealer"}
                            title={isDealer ? "Dealer" : "Not dealer"}
                          />
                        </div>
                        <div className="quick-side-pane">
                          <div className="quick-bid">{entry.bid ?? ""}</div>
                          <div className="quick-actual">{entry.tricks ?? ""}</div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="round-col">Total</th>
              {state.players.map((player, index) => (
                <td key={`total-${player}`} className={`sheet-total ${isWinner(player) ? "winner-total" : ""}`}>
                  {totalsByPlayer[index]}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  function renderStandings(): JSX.Element {
    return (
      <div className="standings-strip">
        {leaderboard.map((row, index) => (
          <div key={`standing-${row.name}`} className={`standing-pill ${isWinner(row.name) ? "winner-pill" : ""}`}>
            <span>{`#${index + 1} ${row.name}`}</span>
            <strong>{row.total}</strong>
          </div>
        ))}
      </div>
    );
  }

  async function handleShareImage(): Promise<void> {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError("");

    try {
      const now = new Date();
      const filename = `wizard-score-sheet-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate(),
      ).padStart(2, "0")}.png`;
      const blob = await buildScoreSheetImage(state, totalsByPlayer, leaderboard, winnerNames);
      const file = new File([blob], filename, { type: "image/png", lastModified: Date.now() });

      const maybeShare = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (typeof maybeShare.share === "function") {
        try {
          const canShareFiles = typeof maybeShare.canShare === "function" ? maybeShare.canShare({ files: [file] }) : true;
          if (canShareFiles) {
            await maybeShare.share({
              title: "Wizard Score Sheet",
              text: "Final Wizard score sheet",
              files: [file],
            });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setDownloadError("Could not generate image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className={`panel score-sheet-panel ${isComplete ? "is-complete" : ""} ${visible ? "" : "hidden"}`}>
      <div className="panel-head">
        <h2>{isComplete ? "Final Score Sheet" : "Score Sheet"}</h2>
        <div className="panel-head-actions">
          {isShareReady && (
            <button type="button" className="btn" onClick={handleShareImage} disabled={isDownloading}>
              {isDownloading ? "Preparing Image..." : "Share / Download Image"}
            </button>
          )}
          {isComplete && canEditPreviousRound && onEditPreviousRound && (
            <button type="button" className="btn" onClick={onEditPreviousRound}>
              Edit Previous Round
            </button>
          )}
        </div>
      </div>
      <div className="score-export-target">
        {isComplete && (
          <p className="winner-banner">
            Winner{winnerNames.length > 1 ? "s" : ""}: <strong>{winnerNames.join(", ")}</strong>
          </p>
        )}
        {renderScoreTable()}

        <div className="scoresheet-mobile">
          {state.rounds.map((_, currentRoundIndex) => (
            <article key={`mobile-round-${currentRoundIndex + 1}`} className="mobile-round-card">
              <h3>{`Round ${currentRoundIndex + 1}`}</h3>
              <div className="mobile-round-head">
                <span>Player</span>
                <span>Bid</span>
                <span>Actual</span>
                <span>Score</span>
              </div>
              {state.players.map((player, playerIndex) => {
                const entry = state.entries[currentRoundIndex][playerIndex];
                const isDealer = (state.startingDealerIndex + currentRoundIndex) % state.players.length === playerIndex;
                return (
                  <div key={`mobile-row-${currentRoundIndex}-${player}`} className="mobile-round-row">
                    <span className="mobile-player">
                      {player}
                      {isDealer && <span className="mobile-dealer">*</span>}
                    </span>
                    <span>{entry.bid ?? ""}</span>
                    <span>{entry.tricks ?? ""}</span>
                    <span className={entry.score >= 0 ? "positive" : "negative"}>
                      {Number.isInteger(entry.bid) && Number.isInteger(entry.tricks) ? entry.score : ""}
                    </span>
                  </div>
                );
              })}
            </article>
          ))}
        </div>

        {renderStandings()}
      </div>
      {downloadError && <p className="helper helper-error">{downloadError}</p>}
      <p className="helper">Circle marker in score cell: filled = dealer, open = non-dealer.</p>
    </section>
  );
}
