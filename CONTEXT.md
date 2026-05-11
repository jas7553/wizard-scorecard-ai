# Wizard Scorecard

Scorecard app for the Wizard card game (AMIGO edition, Ken Fisher). Tracks bids, tricks won, and scores across all rounds of a game.

## Language

**Round**:
One deal of the game — cards are dealt, trump is set, players bid, tricks are played, scores recorded.
_Avoid_: Hand

**Bid**:
A player's prediction of how many tricks they will win in a round (0 to cards dealt).
_Avoid_: Prediction, guess

**Tricks Won**:
The actual number of tricks a player won in a round.
_Avoid_: Tricks (alone — ambiguous), actual tricks

**Trump Suit**:
The designated suit for a round. States: Unset (not yet chosen), None (no trump), Blue, Green, Red, Yellow.
_Avoid_: Trump color, suit (alone)

## Relationships

- A **Game** consists of one or more **Rounds**
- Each **Round** has one **Trump Suit**
- Each **Round** has one **Bid** and one **Tricks Won** value per **Player**

## Flagged ambiguities

- "tricks" appears as both a general concept and as the `RoundEntry.tricks` field — resolved: the field represents **Tricks Won**, not tricks in general
