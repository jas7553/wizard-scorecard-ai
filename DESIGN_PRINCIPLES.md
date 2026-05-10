# Wizard Scorepad Design Principles

This document is the working design reference for the Wizard Scorepad UI/UX overhaul. Future agents and contributors should use it as the default point of reference when making interface, layout, interaction, or content decisions.

The goal is not to maximize visual novelty. The goal is to produce a scorepad that is fast to operate, easy to read in live play, and strong enough visually to feel deliberate rather than generic.

## Product Intent

Wizard Scorepad is an in-person game companion for live tabletop play.

The interface must work for two audiences at the same time:

- the scorekeeper, who needs fast input, clear validation, and low-friction round management
- the players, who need to glance at the device and immediately understand round state, bids, tricks, totals, and standings

The app should feel like a calm tabletop control surface, not a dashboard, form builder, or marketing site.

## Design Direction

### Visual Thesis

A dark, high-contrast tabletop UI with one strong working surface, restrained chrome, clear hierarchy, and score information that remains legible at arm's length.

### Interaction Thesis

- The active round is the primary workspace and should dominate the screen.
- Score context should always be available, but it must not compete with the current round task.
- Mobile and desktop should share the same mental model, not two unrelated layouts.
- Every screen should reduce game friction: less hunting, less mode confusion, less visual noise.

### Tone

- Calm, confident, operational
- Premium without being ornamental
- Thematic enough to feel like Wizard, but never at the expense of readability

## Core Principles

### 1. Playability First

The app exists to support a live game. Any design choice that slows down input, obscures scores, or makes the device harder to use during a round is the wrong choice.

Prefer:

- large, clear numbers
- obvious next actions
- fast thumb-friendly controls
- minimal navigation during active play

Avoid:

- decorative UI that competes with inputs
- dense control clusters
- layouts that require precision tapping
- horizontal scrolling for core round entry

### 2. One Primary Workspace

The active round is the center of the product. It should be visually dominant on both desktop and mobile.

Prefer:

- one main round-entry surface
- supporting score context adjacent to or beneath it
- clear visual separation between current action and historical data

Avoid:

- multiple equal-weight panels fighting for attention
- card grids
- stacked sections that all look equally important

### 3. Shared Visibility Matters

This is not a private personal productivity app. Players should be able to read key information while sitting around a table.

Critical information must be easy to scan from a distance:

- player names
- current round number
- dealer
- trump
- bidding vs trick-entry phase
- current bids or tricks
- cumulative totals
- live standings

If a row or score only works when the device is held close, it is undersized.

### 4. Mobile Is A Primary Use Case

Mobile is not a fallback layout. It is a main operating mode for real games.

Prefer:

- large tap targets
- vertically stacked workflows
- sticky or persistent primary actions when helpful
- compact but readable labels
- short, high-value helper text

Avoid:

- shrinking desktop UI until it technically fits
- tiny headers or labels
- forcing users to open secondary screens for essential round actions

### 5. Desktop Should Feel Like A Tabletop Console

Desktop should not simply center a narrow mobile column. It should use the available width to improve scanability and pace of play.

Prefer:

- a strong main round area
- persistent standings or score context
- enough spacing to make rows easy to distinguish quickly

Avoid:

- overly boxed layouts
- unused horizontal space
- treating desktop like a stretched phone

### 6. Information Hierarchy Over Decoration

Hierarchy should come from composition, spacing, type scale, and contrast before borders, pills, shadows, or gradients.

Prefer:

- fewer containers
- larger differences between primary and secondary text
- one clear accent color for action/state
- section layouts that have a single job

Avoid:

- repeated rounded cards for every section
- multiple competing accents
- visual effects used as a substitute for structure

### 7. Utility Copy Over Flavor Copy

This app is an operating surface. Headings, labels, and helper text should orient the user quickly.

Prefer:

- "Round 4 of 15"
- "Enter bids"
- "Tricks must total 7"
- "Dealer: Maya"

Avoid:

- vague inspirational lines
- game-lore copy in operational areas
- repeated explanatory text once the user is in the flow

### 8. Modes Must Feel Different

Bidding, trick entry, review, and final scoring are different tasks. The UI should make those shifts obvious without requiring explanation.

Prefer:

- distinct labels and button language
- changes in emphasis and layout where useful
- live progress indicators

Avoid:

- subtle mode changes that are easy to miss
- hidden state transitions
- making users infer what step comes next

### 9. Validation Belongs In Context

Interruptive browser dialogs are a last resort. Validation and destructive actions should live inside the interface.

Prefer:

- inline warnings next to the relevant action
- embedded confirmation states
- clear, actionable error copy

Avoid:

- `alert()` or `confirm()`-style interactions
- errors detached from the user action that caused them

### 10. Score Views Need Two Lenses

The product needs both a live game lens and a history lens.

Live game lens:

- current standings
- totals
- key round context
- easy player glanceability

History lens:

- per-round audit trail
- bids, tricks, dealer, and scores
- final review and sharing

Do not force one dense component to serve both use cases equally.

## Layout Guidance

### Home / Setup

- Treat entry as a single intentional opening experience, not a list of generic buttons.
- Prioritize the main action first: continue current game or start a new game.
- Keep setup short, obvious, and forgiving.
- Saved-game state should be visible immediately.

### Active Round

- Round status, dealer, trump, and phase should be visible at the top.
- Player rows should prioritize name, current input, and total.
- The primary action must be unmissable.
- Secondary controls should recede.

### Scores / Standings

- Live standings should be scannable in seconds.
- Full history can be denser, but still needs clear row and column logic.
- Shared readability matters more than decorative table styling.

### Rules / Help

- Default to quick reference over full rulebook presentation.
- Keep help close to the point of need.
- Full rules can exist, but should not dominate the main flow.

## Visual System Guidance

### Typography

- Preserve strong distinction between brand/display type and utility text.
- Use display type sparingly for titles and score-sheet moments.
- Operational text must stay highly legible on small screens and in mixed lighting.

### Color

- Keep the dark tabletop mood.
- Use one primary accent for action and state.
- Reserve stronger highlight colors for high-value moments: dealer, winner, completion, validation.
- Color must never be the only indicator of meaning.

### Motion

Use motion only when it improves orientation or atmosphere.

Good uses:

- phase transitions
- score-sheet reveal
- final-state celebration
- subtle entrance sequencing

Bad uses:

- constant ambient motion
- decorative hover behavior on core controls
- transitions that delay rapid score entry

## Anti-Patterns

Future agents should avoid these unless there is a strong product reason:

- generic SaaS card grids
- boxed hero sections for the main app surface
- excessive glassmorphism or border-heavy panels
- tiny metadata text that holds important game information
- horizontal-scroll gameplay flows on mobile
- decorative icons that do not improve scanning
- ornamental gradients behind routine product UI
- burying the main action below secondary information

## Success Criteria

A successful overhaul should satisfy all of the following:

- A scorekeeper can run a full round on mobile quickly with one hand and without pinch-zooming.
- Players can identify their name, current bid or tricks, and total score at a glance.
- Desktop uses space to improve clarity, not just to enlarge the same stacked layout.
- The active round clearly feels like the primary task at all times.
- Live standings are easy to check without losing the current round context.
- Score history is available for auditing and sharing without overwhelming active play.
- Validation is immediate, local, and understandable.
- The interface feels deliberate and premium even if shadows and decorative effects are removed.

## Decision Rule For Future UI Changes

When choosing between two design options, prefer the one that:

1. makes active play faster
2. improves readability from a short distance
3. preserves a clear primary workspace
4. works cleanly on mobile first
5. reduces visual noise rather than adding it

If a change helps branding but hurts live play, reject it.
