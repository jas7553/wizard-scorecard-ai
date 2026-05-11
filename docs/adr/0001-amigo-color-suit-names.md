# Use AMIGO color names for trump suits

This app targets the AMIGO edition of Wizard, which uses color-coded suits (Blue, Green, Red, Yellow) rather than the standard playing-card suits (Hearts, Clubs, Diamonds, Spades). We use the color names throughout the codebase and UI to match the physical deck and the language players use at the table. Standard suit names were considered but rejected because they don't map to the AMIGO deck and would confuse players using this app mid-game.

## Consequences

`TrumpChoice` values in localStorage use the color name strings. Any migration of persisted game state must account for this — renaming suit values is a breaking change for in-progress games.
