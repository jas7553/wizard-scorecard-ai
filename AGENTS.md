# Repository Guidelines

## Project Structure & Module Organization
This repository is a small React + TypeScript scorepad app bundled with Webpack. Application code lives in `src/`: `App.tsx` owns game state and flow, `components/` contains screen-level UI panels, `types.ts` holds shared types, and `styles.css` contains the global visual system. Static HTML lives in `public/index.html`, and production output is written to `dist/`. There is no dedicated `tests/` directory yet.

## Build, Test, and Development Commands
Use `npm start` to run the Webpack dev server at `http://localhost:3000` with hot reload. Use `npm run build` to create a production bundle in `dist/`. Use `npm run typecheck` to run `tsc --noEmit` and catch TypeScript errors before opening a PR. Example:

```bash
npm start
npm run typecheck
npm run build
```

## Coding Style & Naming Conventions
Follow the existing TypeScript/React style: 2-space indentation, semicolons, and double quotes. Use PascalCase for React component files and exported component names (`ScoreSheetPanel.tsx`), camelCase for functions and variables, and UPPER_SNAKE_CASE for top-level constants such as storage keys. Keep shared types in `src/types.ts` unless a component-specific type is truly local. Prefer functional components and colocate small helper functions near the feature that uses them.

## Testing Guidelines
Automated tests are not configured yet, so every change should at minimum pass `npm run typecheck` and a manual browser smoke test through the main flows: setup, bidding, trick entry, score sheet, persistence, and end-game sharing. If you add non-trivial scoring or state logic, add a test harness with the change rather than relying on manual checks alone.

## Commit & Pull Request Guidelines
Current history uses short, imperative commit subjects (`Initial commit, built with Codex by OpenAI`). Keep that pattern: one-line summaries such as `Add round trump validation`. Pull requests should include a concise description, the user-visible impact, verification steps, and screenshots or short recordings for UI changes. Link the relevant issue when one exists.

## Configuration Notes
Do not commit secrets or environment-specific overrides. This app uses browser `localStorage` for persistence, so clear saved state when validating onboarding or migration changes.
