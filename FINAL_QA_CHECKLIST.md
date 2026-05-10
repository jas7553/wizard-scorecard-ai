# Wizard Scorepad Final QA Checklist

This checklist is the Milestone 8 regression and real-use validation pass for the UI/UX overhaul.

## Automated Verification

- [x] `npm run typecheck`
- [x] `npm run build`
- [x] Confirm no remaining `window.alert` / `window.confirm` usage in `src/`

## Manual Browser Verification

### Entry And Setup

- [ ] Open the app with no saved game and confirm the setup flow is the primary path.
- [ ] Open the app with saved state and confirm resume is the dominant primary action.
- [ ] Start a new game from home while a saved game exists and confirm inline replacement UI works.
- [ ] Enter fewer than 3 players and confirm setup validation appears inline.
- [ ] Enter duplicate player names and confirm setup validation appears inline.
- [ ] Add 3, 4, 5, and 6 players and confirm the displayed round count is correct.
- [ ] Select a starting dealer and confirm the choice is visually clear.
- [ ] Clear saved state from setup and confirm inline destructive confirmation works.

### Active Round

- [ ] Confirm the active round is visually dominant on desktop.
- [ ] Confirm the active round is visually dominant on mobile.
- [ ] In bidding mode, enter bids using both direct numeric entry and `+` / `-` controls.
- [ ] Submit bids and confirm the phase visibly changes to trick entry.
- [ ] In trick-entry mode, confirm the bids remain visible as locked reference.
- [ ] Enter an invalid trick total and confirm validation appears inline on the round surface.
- [ ] Save a valid round and confirm round advancement works correctly.
- [ ] Move back to a previous round and confirm navigation still works.
- [ ] Confirm dealer highlighting rotates correctly round to round.
- [ ] Confirm the final round forces no trump.

### Live Standings And History

- [ ] During active play, confirm standings remain visible without overpowering the round workspace.
- [ ] Confirm the leader summary and ranking rows are readable from a short distance.
- [ ] Expand and collapse the score history during an in-progress game.
- [ ] Confirm the history view remains secondary to live standings during active play.

### Final State And Sharing

- [ ] Finish a complete game and confirm the final-summary hero appears.
- [ ] Confirm winner handling works for both a single winner and a tie.
- [ ] Review the round audit table and mobile history cards for completed-game readability.
- [ ] Trigger share/export and confirm native share works when supported.
- [ ] Trigger share/export in a non-sharing environment and confirm download fallback works.

### Persistence And Edge States

- [ ] Refresh during setup and confirm the intended screen state persists correctly.
- [ ] Refresh during an active game and confirm game state and current screen restore correctly.
- [ ] Refresh on the rules screen and confirm screen mode persistence still behaves correctly.
- [ ] Validate empty, in-progress, and completed states for layout consistency.

### Accessibility And Interaction Polish

- [ ] Tab through all primary controls and confirm visible focus states are clear.
- [ ] Confirm inline warnings and confirmations are readable and visually distinct.
- [ ] Verify controls remain usable with reduced precision on a narrow mobile viewport.
- [ ] Check contrast/readability in the round workspace, rail, and rules screen.
- [ ] Validate `prefers-reduced-motion` behavior if the browser/device supports it.

## Current Known Follow-Up

- `npm run build` succeeds, but webpack emits a performance warning because the main bundle is `245 KiB`, slightly above the `244 KiB` recommendation. This is not a functional blocker, but it is a performance follow-up worth tracking.
