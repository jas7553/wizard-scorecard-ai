import React, { useEffect, useState } from "react";
import { GameState, LeaderboardRow } from "../types";

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
  const [isExpanded, setIsExpanded] = useState<boolean>(isComplete);

  const isWinner = (name: string): boolean => winnerNames.includes(name);
  const isShareReady = isComplete && visible;
  const leader = leaderboard[0] ?? null;
  const completedRounds = state.roundPhases.filter((phase) => phase === "complete").length;
  const bestScore = totalsByPlayer.length > 0 ? Math.max(...totalsByPlayer) : 0;
  const lowestScore = totalsByPlayer.length > 0 ? Math.min(...totalsByPlayer) : 0;

  useEffect(() => {
    if (isComplete) {
      setIsExpanded(true);
    }
  }, [isComplete]);

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
            <div className="standing-copy">
              <span className="standing-rank">{`#${index + 1}`}</span>
              <div>
                <strong className="standing-name">{row.name}</strong>
                <span className="standing-status">
                  {index === 0 ? "Current leader" : index === leaderboard.length - 1 ? "Currently trailing" : "In contention"}
                </span>
              </div>
            </div>
            <strong className="standing-total">{row.total}</strong>
          </div>
        ))}
      </div>
    );
  }

  function renderFinalHero(): JSX.Element | null {
    if (!isComplete || !leader) {
      return null;
    }

    return (
      <section className="final-summary-hero">
        <div className="final-summary-copy">
          <span className="live-standings-label">Game Complete</span>
          <h3>{winnerNames.length > 1 ? winnerNames.join(", ") : leader.name}</h3>
          <p>{winnerNames.length > 1 ? "Shared first place after the final round." : "Finished on top after the final round."}</p>
        </div>
        <div className="final-summary-stats">
          <div className="final-summary-stat">
            <span>Winning score</span>
            <strong>{bestScore}</strong>
          </div>
          <div className="final-summary-stat">
            <span>Rounds played</span>
            <strong>{completedRounds}</strong>
          </div>
          <div className="final-summary-stat">
            <span>Field spread</span>
            <strong>{bestScore - lowestScore}</strong>
          </div>
        </div>
      </section>
    );
  }

  function buildScoreSheetImageCanvas(): HTMLCanvasElement {
    const roundCount = state.rounds.length;
    const playerCount = state.players.length;

    const padding = 24;
    const titleBlockHeight = 56;
    const winnerLineHeight = 26;
    const tableRowHeight = 34;
    const roundColWidth = 68;
    const playerColWidth = 126;
    const tableWidth = roundColWidth + playerCount * playerColWidth;
    const tableHeight = tableRowHeight * (roundCount + 2);
    const standingsGap = 8;
    const standingsCols = Math.min(3, Math.max(1, playerCount));
    const standingsRows = Math.ceil(leaderboard.length / standingsCols);
    const standingsItemHeight = 34;
    const standingsHeight = standingsRows * standingsItemHeight + Math.max(0, standingsRows - 1) * standingsGap;

    const canvasWidth = padding * 2 + tableWidth;
    const canvasHeight = padding * 2 + titleBlockHeight + winnerLineHeight + tableHeight + 18 + standingsHeight + 22;
    const dpr = Math.max(2, window.devicePixelRatio || 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }
    ctx.scale(dpr, dpr);
    ctx.textBaseline = "middle";

    const isWinner = (name: string): boolean => winnerNames.includes(name);
    const tableX = padding;
    const tableY = padding + titleBlockHeight + winnerLineHeight;
    const totalsY = tableY + tableRowHeight * (roundCount + 1);

    ctx.fillStyle = "#090b10";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "#f6e38c";
    ctx.font = "700 34px Cinzel, Georgia, serif";
    ctx.fillText("FINAL SCORE SHEET", padding, padding + 16);

    ctx.fillStyle = "#fde68a";
    ctx.font = "700 24px Outfit, system-ui, sans-serif";
    ctx.fillText(`Winner${winnerNames.length > 1 ? "s" : ""}: ${winnerNames.join(", ")}`, padding, padding + 48);

    ctx.fillStyle = "#f4f1e7";
    ctx.fillRect(tableX, tableY, tableWidth, tableHeight);

    state.players.forEach((player, index) => {
      if (!isWinner(player)) {
        return;
      }
      const x = tableX + roundColWidth + index * playerColWidth;
      ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
      ctx.fillRect(x, tableY, playerColWidth, tableHeight);
    });

    ctx.strokeStyle = "rgba(17, 24, 39, 0.5)";
    ctx.lineWidth = 1;

    for (let row = 0; row <= roundCount + 2; row += 1) {
      const y = tableY + row * tableRowHeight;
      ctx.beginPath();
      ctx.moveTo(tableX, y);
      ctx.lineTo(tableX + tableWidth, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(tableX + roundColWidth, tableY);
    ctx.lineTo(tableX + roundColWidth, tableY + tableHeight);
    ctx.stroke();

    for (let playerIndex = 0; playerIndex <= playerCount; playerIndex += 1) {
      const x = tableX + roundColWidth + playerIndex * playerColWidth;
      ctx.beginPath();
      ctx.moveTo(x, tableY);
      ctx.lineTo(x, tableY + tableHeight);
      ctx.stroke();
    }

    ctx.fillStyle = "#111827";
    ctx.font = "700 22px Cinzel, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("*", tableX + roundColWidth / 2, tableY + tableRowHeight / 2);

    state.players.forEach((player, index) => {
      const centerX = tableX + roundColWidth + index * playerColWidth + playerColWidth / 2;
      ctx.font = "700 14px Cinzel, Georgia, serif";
      ctx.fillText(player.toUpperCase(), centerX, tableY + tableRowHeight / 2);
    });

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
      const y = tableY + (roundIndex + 1) * tableRowHeight;
      ctx.fillStyle = "#111827";
      ctx.font = "700 14px Cinzel, Georgia, serif";
      ctx.fillText(String(roundIndex + 1), tableX + roundColWidth / 2, y + tableRowHeight / 2);

      state.players.forEach((_, playerIndex) => {
        const entry = state.entries[roundIndex][playerIndex];
        const dealerIndex = (state.startingDealerIndex + roundIndex) % state.players.length;
        const isDealer = dealerIndex === playerIndex;
        const cellX = tableX + roundColWidth + playerIndex * playerColWidth;
        const scorePaneWidth = Math.round(playerColWidth * 0.65);
        const sidePaneWidth = playerColWidth - scorePaneWidth;
        const sideMidY = y + tableRowHeight / 2;

        ctx.beginPath();
        ctx.moveTo(cellX + scorePaneWidth, y);
        ctx.lineTo(cellX + scorePaneWidth, y + tableRowHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cellX + scorePaneWidth, sideMidY);
        ctx.lineTo(cellX + scorePaneWidth + sidePaneWidth, sideMidY);
        ctx.stroke();

        const showScore = Number.isInteger(entry.bid) && Number.isInteger(entry.tricks);
        ctx.fillStyle = entry.score >= 0 ? "#3b82f6" : "#d97706";
        ctx.font = "700 12px Outfit, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(showScore ? String(entry.score) : "", cellX + scorePaneWidth / 2, y + tableRowHeight / 2);

        ctx.fillStyle = "#111827";
        ctx.font = "500 12px Outfit, system-ui, sans-serif";
        ctx.fillText(String(entry.bid ?? ""), cellX + scorePaneWidth + sidePaneWidth / 2, y + tableRowHeight * 0.26);
        ctx.fillText(String(entry.tricks ?? ""), cellX + scorePaneWidth + sidePaneWidth / 2, y + tableRowHeight * 0.76);

        const dotX = cellX + scorePaneWidth - 8;
        const dotY = y + tableRowHeight - 8;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3.8, 0, Math.PI * 2);
        if (isDealer) {
          ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(17, 24, 39, 0.75)";
          ctx.stroke();
          ctx.strokeStyle = "rgba(17, 24, 39, 0.5)";
        }
      });
    }

    ctx.fillStyle = "#111827";
    ctx.font = "700 14px Cinzel, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("TOTAL", tableX + roundColWidth / 2, totalsY + tableRowHeight / 2);

    totalsByPlayer.forEach((total, index) => {
      const x = tableX + roundColWidth + index * playerColWidth + playerColWidth / 2;
      ctx.font = "700 28px Outfit, system-ui, sans-serif";
      ctx.fillStyle = "#111827";
      ctx.fillText(String(total), x, totalsY + tableRowHeight / 2);
    });

    const standingsY = tableY + tableHeight + 18;
    const standingsWidth = tableWidth;
    const standingsItemWidth = (standingsWidth - standingsGap * (standingsCols - 1)) / standingsCols;

    leaderboard.forEach((row, index) => {
      const column = index % standingsCols;
      const rowIndex = Math.floor(index / standingsCols);
      const x = tableX + column * (standingsItemWidth + standingsGap);
      const y = standingsY + rowIndex * (standingsItemHeight + standingsGap);

      ctx.fillStyle = isWinner(row.name) ? "rgba(245, 158, 11, 0.18)" : "rgba(2, 6, 23, 0.4)";
      ctx.strokeStyle = isWinner(row.name) ? "rgba(245, 158, 11, 0.65)" : "rgba(148, 163, 184, 0.36)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, standingsItemWidth, standingsItemHeight, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e7edf7";
      ctx.font = "600 13px Outfit, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`#${index + 1} ${row.name}`, x + 10, y + standingsItemHeight / 2);
      ctx.textAlign = "right";
      ctx.font = "700 13px Outfit, system-ui, sans-serif";
      ctx.fillText(String(row.total), x + standingsItemWidth - 10, y + standingsItemHeight / 2);
    });

    ctx.textAlign = "left";
    ctx.font = "500 11px Outfit, system-ui, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(
      "Circle marker in score cell: filled = dealer, open = non-dealer.",
      padding,
      standingsY + standingsHeight + 16,
    );

    return canvas;
  }

  function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to render image"));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
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
      const canvas = buildScoreSheetImageCanvas();
      const blob = await canvasToBlob(canvas);
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

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <div>
          <h2>{isComplete ? "Final Score Sheet" : "Standings"}</h2>
        </div>
        <div className="panel-head-actions">
          {!isComplete && (
            <button
              type="button"
              className="btn btn-subtle"
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              aria-controls="score-sheet-history"
            >
              {isExpanded ? "Hide Score Sheet" : "View Score Sheet"}
            </button>
          )}
          {isShareReady && (
            <button type="button" className="btn btn-primary" onClick={handleShareImage} disabled={isDownloading}>
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
        {renderFinalHero()}
        {isComplete && (
          <div className="winner-banner">
            <span>Winner{winnerNames.length > 1 ? "s" : ""}</span>
            <strong>{winnerNames.join(", ")}</strong>
          </div>
        )}
        {renderStandings()}

        <div
          id="score-sheet-history"
          className={`score-sheet-history ${isExpanded ? "is-expanded" : ""} ${isComplete ? "is-complete" : ""}`}
        >
          <div className="history-head">
            <div>
              <span className="live-standings-label">{isComplete ? "Round Audit" : "History"}</span>
              <h3>{isComplete ? "Full score sheet" : "Round-by-round review"}</h3>
            </div>
            <p className="helper">
              {isComplete
                ? "Review bids, tricks, dealer order, and per-round scoring before sharing the final result."
                : "Open the audit trail only when you need detail beyond the live standings."}
            </p>
          </div>
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
        </div>
      </div>
      {downloadError && (
        <p className="helper helper-error" role="alert" aria-live="assertive">
          {downloadError}
        </p>
      )}
      {(isExpanded || isComplete) && (
        <p className="helper">Circle marker in score cell: filled = dealer, open = non-dealer.</p>
      )}
    </section>
  );
}
