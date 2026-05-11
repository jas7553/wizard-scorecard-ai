# Persist game state to localStorage with no backend

Game state and screen mode are persisted to the browser's localStorage only — there is no backend, user accounts, or cross-device sync. Wizard is a physical card game played in person; players share one device as a scorecard. Cloud sync and multi-device support add complexity without matching the use case. The consequence is that game state lives in the browser: clearing localStorage or switching devices loses the current game. Any future change to the persisted data shape is a breaking migration for in-progress games.
