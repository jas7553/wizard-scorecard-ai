# Wizard Scorecard

Scorecard app for the Wizard card game (AMIGO edition, Ken Fisher). Tracks bids, tricks won, and scores across all rounds of a game.

## Language

**Game**:
A complete play-through of Wizard from player setup through the final round. "A game of Wizard."
_Avoid_: Session, match

**Round**:
One deal of the game — cards are dealt, trump is set, players bid, tricks are played, scores recorded.
_Avoid_: Hand

**Dealer**:
The player responsible for dealing cards in a given round. Rotates each round; the starting dealer is chosen at game setup.

**Bid**:
A player's prediction of how many tricks they will win in a round (0 to cards dealt).
_Avoid_: Prediction, guess

**Tricks Won**:
The actual number of tricks a player won in a round.
_Avoid_: Tricks (alone — ambiguous), actual tricks

**Round Phase**:
The lifecycle state of a round: Bidding (entering bids) → Results (entering Tricks Won after play) → Complete (round finalized, scores locked).
_Avoid_: "tricks" as a phase name (ambiguous)

**Wizard Card**:
A special card that always wins the trick. When flipped as the trump card, the Dealer chooses the Trump Suit. Not tracked by the app — only the resulting Trump Suit is recorded.

**Jester Card**:
A special card that always loses the trick. When flipped as the trump card, Trump Suit is None. Not tracked by the app.

**Trump Suit**:
The designated suit for a round. States: Unset (not yet chosen), None (no trump), Blue, Green, Red, Yellow.
_Avoid_: Trump color, suit (alone)

**Score**:
Points earned in a round (exact match: 20 + bid×10; miss: |bid−tricks won|×−10). "Score" applies to both per-round and cumulative totals; context disambiguates.

**Winner**:
The player(s) with the highest Score at the end of a Game. Ties are possible and valid — no tiebreaker.

## Relationships

- A **Game** consists of N **Rounds** (N = 20/15/12/10 for 3/4/5/6 players)
- Each **Round** has one **Dealer**, one **Trump Suit**, and one **Round Phase**
- Each **Round** has one **Bid** and one **Tricks Won** per **Player**, from which a **Score** is computed
- The final **Round** always has Trump Suit = None
- A **Wizard Card** flip gives the **Dealer** choice of Trump Suit; a **Jester Card** flip sets Trump Suit to None
- The **Winner** is the **Player**(s) with the highest cumulative **Score** after all **Rounds**

## Example dialogue

> **Dev:** "After the round ends, do we show the Score immediately or wait for the player to confirm?"
> **Domain expert:** "As soon as all Tricks Won are entered and the round is Complete, the Score is shown. No confirmation step."

> **Dev:** "What Trump Suit do we record when a Wizard Card is flipped?"
> **Domain expert:** "Whatever the Dealer picks — Blue, Green, Red, or Yellow. The app just records the choice, not the flip."

## Flagged ambiguities

- "tricks" alone is ambiguous — resolved: always say **Bid** (prediction) or **Tricks Won** (result), never "tricks" alone in domain discussions
- `RoundPhase` value `"tricks"` in code → renamed to `"results"` to match domain language
