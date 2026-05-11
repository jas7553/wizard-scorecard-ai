import type { GameState, LeaderboardRow } from "./types";

export function buildScoreSheetImage(
  state: GameState,
  totalsByPlayer: number[],
  leaderboard: LeaderboardRow[],
  winnerNames: string[],
): Promise<Blob> {
  const canvas = buildCanvas(state, totalsByPlayer, leaderboard, winnerNames);
  return canvasToBlob(canvas);
}

function buildCanvas(
  state: GameState,
  totalsByPlayer: number[],
  leaderboard: LeaderboardRow[],
  winnerNames: string[],
): HTMLCanvasElement {
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
