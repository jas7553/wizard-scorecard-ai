# Wizard Scorepad

A mobile-friendly Wizard scorepad web app built with React + TypeScript + Webpack.

The app is designed for in-person play: enter bids, lock bids, enter tricks won, and track cumulative scoring round-by-round. It includes a rules screen, persistent state, and end-of-game sharing.

The UI/UX overhaul reference for future work lives in [`DESIGN_PRINCIPLES.md`](/Users/jason/Developer/wizard-ai/DESIGN_PRINCIPLES.md).
The milestone-based execution roadmap for that overhaul lives in [`UI_UX_PROJECT_PLAN.md`](/Users/jason/Developer/wizard-ai/UI_UX_PROJECT_PLAN.md).

## Tech Stack

- React 18
- TypeScript
- Webpack 5 + Babel
- Plain CSS
- Local storage for persistence

## Core Gameplay Flow

1. Set up a game with 3-6 players and choose the starting dealer.
2. Rounds are automatically determined by player count (official Wizard lengths):
   - 3 players: 20 rounds
   - 4 players: 15 rounds
   - 5 players: 12 rounds
   - 6 players: 10 rounds
3. For each round:
   - Enter bids and submit.
   - Enter tricks won and save round.
4. Review a score-sheet style leaderboard and final results.

## Key Features

- Dealer rotation and clear dealer highlighting
- Bidding phase and play phase separation
- Wizard scoring + round validation (including trick-total checks)
- Trump tracking per round (final round fixed to no trump)
- Rules page based on official wording
- Responsive UI for desktop and mobile browsers
- Persistent game + screen mode on refresh (`localStorage`)
- End-game image export:
  - Native share-sheet path when supported
  - Download fallback

## Scripts

- `npm start` - run dev server (`localhost:3000`)
- `npm run build` - production build to `dist/`
- `npm run typecheck` - TypeScript checks (`tsc --noEmit`)

## Project Layout

- `/Users/jason/Developer/wizard-ai/public/index.html`
- `/Users/jason/Developer/wizard-ai/src/App.tsx`
- `/Users/jason/Developer/wizard-ai/src/components/*`
- `/Users/jason/Developer/wizard-ai/src/styles.css`
- `/Users/jason/Developer/wizard-ai/src/types.ts`
- `/Users/jason/Developer/wizard-ai/webpack.config.js`
- `/Users/jason/Developer/wizard-ai/tsconfig.json`
