# Wizard Scorepad UI/UX Overhaul Plan

This document translates the design principles in [`DESIGN_PRINCIPLES.md`](/Users/jason/Developer/wizard-ai/DESIGN_PRINCIPLES.md) into a practical project plan for future AI agents and contributors.

It is intentionally milestone-based and high-level. Each milestone is meant to be achievable through multiple focused implementation tasks and validated incrementally.

## How To Use This Plan

- Use [`DESIGN_PRINCIPLES.md`](/Users/jason/Developer/wizard-ai/DESIGN_PRINCIPLES.md) as the decision framework.
- Use this document as the execution roadmap.
- When making UI changes, align the current task to one milestone first.
- Prefer finishing a milestone cleanly before starting broad polish across the whole app.

## Project Goals

The overhaul should produce a Wizard scorepad that:

- is fast and reliable for the scorekeeper
- is readable for players glancing at the device during live play
- works cleanly on both desktop and mobile browsers
- presents a clear primary workspace during active rounds
- feels deliberate and premium without sacrificing usability

## Milestone 1: Product Foundation And Layout Strategy

### Objective

Establish the core UI architecture so future work is built on a consistent desktop/mobile layout model rather than isolated screen tweaks.

### High-Level Tasks

- Audit the current app shell and identify which regions are primary workspace, secondary context, navigation, and help.
- Define the target page/screen structure for:
  - entry flow
  - setup
  - active round
  - standings/live score context
  - score history/final state
  - rules/help
- Create a shared layout strategy for desktop and mobile that preserves one mental model across both.
- Refactor the top-level app composition so major surfaces are intentionally placed rather than stacked as equal-weight panels.
- Establish reusable spacing, type, color, and hierarchy tokens to support the new design system.

### Deliverables

- A revised app shell/layout structure
- A clearer primary/secondary content model
- Baseline design tokens or CSS variables for the overhaul

### Completion Criteria

- Desktop and mobile layouts have a clear structural plan.
- The active round can be made visually dominant without fighting the overall app shell.
- New UI work can build on a consistent surface hierarchy.

## Milestone 2: Entry Flow And Setup Overhaul

### Objective

Turn the current home/setup experience into a clear opening flow that quickly gets players into a game and handles saved state gracefully.

### High-Level Tasks

- Redesign the entry screen so it presents one dominant primary action and clear saved-game status.
- Reduce generic button-list presentation in favor of a more intentional composition.
- Merge or better coordinate home and setup flows where that reduces friction.
- Improve the player setup experience:
  - clearer player-name entry
  - better starting-dealer selection
  - more obvious minimum/maximum player guidance
- Replace browser alerts or confirms in setup/reset flows with inline confirmation and validation UI.
- Ensure the opening experience works well on both narrow mobile screens and wider desktop screens.

### Deliverables

- Revised home/start flow
- Revised setup flow
- Inline saved-game and reset handling

### Completion Criteria

- Starting or resuming a game is obvious within seconds.
- Setup errors are local and understandable.
- The opening flow feels like part of the product, not a temporary utility screen.

## Milestone 3: Active Round Workspace Redesign

### Objective

Make the live round the strongest and most usable surface in the app.

### High-Level Tasks

- Redesign the round header to make phase, round number, dealer, and trump immediately scannable.
- Rework player-entry rows for better shared readability:
  - larger name treatment
  - clearer current input state
  - more legible totals
  - stronger dealer emphasis
- Tune round-state communication so bidding and trick-entry modes feel distinct.
- Rebalance control priority so the main round action is visually dominant and secondary actions recede.
- Improve numeric input ergonomics for rapid entry on touch devices.
- Reduce unnecessary panel/card treatment inside the round workspace.
- Add or refine progress indicators that help users understand whether bids or tricks are complete.

### Deliverables

- New active-round layout
- Revised player-row interaction pattern
- Stronger round-state and progress UI

### Completion Criteria

- The round screen can be understood in one quick scan.
- A scorer can move through bids and tricks quickly on mobile.
- Players can identify their row, the current phase, and totals without help.

## Milestone 4: Live Standings And Score Context

### Objective

Provide fast shared score visibility during the game without overwhelming the active round workflow.

### High-Level Tasks

- Separate live standings from full historical score detail conceptually and visually.
- Design a standings view optimized for quick table-wide scanning.
- Decide how standings remain visible during active play on desktop and mobile.
- Improve total-score presentation, winner/leader emphasis, and tie handling.
- Reduce decorative treatments that make standings feel like generic pills or cards.
- Ensure live score context remains readable from a short distance.

### Deliverables

- Revised in-game standings component
- Better live score context placement and hierarchy

### Completion Criteria

- Users can check current standings without losing round context.
- Standings are readable, compact, and meaningfully distinct from round-entry controls.

## Milestone 5: Score History, Review, And End-Game Experience

### Objective

Make the score-sheet/history experience useful for review, auditing, and sharing without letting it dominate live play.

### High-Level Tasks

- Redesign the score history view as a dedicated review lens rather than a secondary dump of data.
- Improve readability of per-round audit information:
  - bids
  - tricks
  - round score
  - dealer markers
- Rework mobile history presentation so it is intentionally designed, not just a hidden-table fallback.
- Refine the completed-game state to feel conclusive and easy to review.
- Improve the share/export presentation so the final artifact is legible and visually aligned with the new design system.
- Ensure history and final review feel denser than the active round, but still organized and calm.

### Deliverables

- Revised score history view
- Revised completed-game state
- Improved final share/export presentation

### Completion Criteria

- History is easy to audit.
- Final results feel definitive and polished.
- The score sheet serves post-game review without interfering with live play priorities.

## Milestone 6: Rules, Help, And Inline Guidance

### Objective

Move support content closer to actual gameplay needs and reduce full-screen rule interruption.

### High-Level Tasks

- Reassess whether the current full rules page should remain a primary navigation destination.
- Introduce quick-reference or contextual help patterns for common gameplay questions.
- Reduce the amount of dense text shown during normal app use.
- Keep full rules accessible, but visually secondary to gameplay.
- Standardize helper text, warnings, and instructional copy throughout the app.

### Deliverables

- Revised help/rules model
- Contextual quick-reference patterns
- Cleaner operational copy

### Completion Criteria

- Help is available when needed without breaking flow.
- Operational screens are not weighed down by long-form text.

## Milestone 7: Interaction Polish And Accessibility

### Objective

Raise the usability quality bar through better feedback, accessibility, and refined interaction behavior.

### High-Level Tasks

- Replace remaining interruptive dialogs with inline patterns where appropriate.
- Audit touch targets, focus states, keyboard accessibility, and semantic labeling.
- Improve contrast and readability under mobile and tabletop use conditions.
- Add restrained motion only where it improves orientation, state change, or completion feedback.
- Validate reduced-motion behavior and ensure polish does not slow down gameplay.

### Deliverables

- Accessibility and interaction refinement pass
- Final feedback, validation, and motion polish

### Completion Criteria

- Core flows are accessible and clear.
- Motion supports orientation rather than decoration.
- The product feels more refined without becoming slower or noisier.

## Milestone 8: Final QA And Real-Use Validation

### Objective

Confirm that the new UI actually satisfies the product goals in realistic play conditions.

### High-Level Tasks

- Test the main flows on both desktop and mobile browsers.
- Validate setup, bidding, trick entry, score review, persistence, and end-game sharing.
- Check the app in scenarios where players are reading from a short distance rather than holding the device directly.
- Review empty, partial, in-progress, and completed states for consistency.
- Ensure no milestone introduced regressions in game logic or data persistence.
- Run typecheck and build validation after milestone completions.

### Deliverables

- Final cross-device verification pass
- Regression checklist for core gameplay flows

### Completion Criteria

- The overhaul works reliably in realistic play scenarios.
- The UI satisfies the design principles in practice, not just in static layout.

## Suggested Work Sequencing

Recommended order:

1. Milestone 1: Product Foundation And Layout Strategy
2. Milestone 2: Entry Flow And Setup Overhaul
3. Milestone 3: Active Round Workspace Redesign
4. Milestone 4: Live Standings And Score Context
5. Milestone 5: Score History, Review, And End-Game Experience
6. Milestone 6: Rules, Help, And Inline Guidance
7. Milestone 7: Interaction Polish And Accessibility
8. Milestone 8: Final QA And Real-Use Validation

If scope must be reduced, preserve this priority order:

1. active round usability
2. mobile playability
3. standings/readability for players
4. setup/entry improvements
5. final-state polish

## Task Rules For Future Agents

When executing this project plan:

- Always anchor the task to the current milestone.
- Prefer high-value structural work over broad visual polish.
- Do not add decorative complexity before the layout and interaction model are sound.
- Validate mobile and desktop behavior for every milestone that affects active play.
- Treat design-principle violations as project issues, even if the UI looks visually interesting.

## Definition Of Done For The Overhaul

The project is complete when:

- the active round is clearly the main workspace
- both mobile and desktop are intentionally designed for live play
- players can read key score information at a glance
- the scorekeeper can move quickly through a real game
- setup, validation, review, and sharing all feel integrated
- the interface feels calm, modern, and deliberate without relying on heavy chrome
