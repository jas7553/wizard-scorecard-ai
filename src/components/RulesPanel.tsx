import React from "react";

interface RulesPanelProps {
  visible: boolean;
}

export default function RulesPanel({ visible }: RulesPanelProps): JSX.Element {
  return (
    <section className={`panel rules-panel ${visible ? "" : "hidden"}`} id="rules-panel">
      <div className="rules-head">
        <div>
          <p className="eyebrow">Reference</p>
          <h2>Rules And Quick Help</h2>
          <p className="helper">Start with the fast reminders below. Use the full rulebook only when the table needs detail.</p>
        </div>
      </div>

      <section className="rules-quick-reference">
        <article className="quick-reference-card">
          <strong>Bidding</strong>
          <span>Each player predicts exact tricks taken. Zero is allowed. Standard scoring does not require bids to match available tricks.</span>
        </article>
        <article className="quick-reference-card">
          <strong>Trump</strong>
          <span>Jester face-up card means no trump. Wizard face-up card lets dealer choose trump. Final round is always no trump.</span>
        </article>
        <article className="quick-reference-card">
          <strong>Scoring</strong>
          <span>Exact bid scores 20 plus 10 per trick. Missed bid loses 10 per trick over or under.</span>
        </article>
      </section>

      <div className="rules-content">
        <p className="rules-intro">
          <strong>MEDIEVAL WIZARD:</strong> Card game for 3-6 players, ages 10 and up.
        </p>

        <details className="rules-section" open>
          <summary>Object Of The Game</summary>
          <p>
            Correctly predict the exact number of tricks you will take in each round. You receive points for being correct,
            and the person with the most points wins.
          </p>
        </details>

        <details className="rules-section" open>
          <summary>The Deal</summary>
          <p>
            Determine a dealer by dealing one card to each player; high card deals first. On the first deal each player
            gets one card, then two cards on the second deal, three on the third, and so on. Deal passes left after each
            round. After the deal, turn up the next card to determine trump.
          </p>
          <p>
            If the turned card is a Jester, there is no trump for that round. If it is a Wizard, the dealer chooses one
            of the four suits as trump. On the final round, all cards are dealt and there is no trump.
          </p>
        </details>

        <details className="rules-section" open>
          <summary>Bidding</summary>
          <p>
            Starting to the dealer's left, each player states how many tricks they will take (zero is allowed). The scorer
            records each bid. Total bids do not need to equal available tricks unless an optional variation is being used.
          </p>
        </details>

        <details className="rules-section">
          <summary>The Play</summary>
          <p>
            Play begins left of dealer. Any card may be led. Players must follow suit if possible. If they cannot, they may
            play any card, including trump. A Wizard or Jester may be played at any time.
          </p>
          <p>
            A trick is won by: (1) first Wizard played; (2) if no Wizard, highest trump played; (3) if no trump, highest
            card of suit led. Trick winner leads next.
          </p>
        </details>

        <details className="rules-section">
          <summary>Leading Wizards Or Jesters</summary>
          <p>
            If the lead card is a Wizard, it wins the trick and any card may be played afterward. If the lead card is a
            Jester, it is a null card and suit for the trick is set by the next card played. Jesters always lose, except
            when only Jesters are played, in which case the first Jester wins.
          </p>
        </details>

        <details className="rules-section">
          <summary>Scoring</summary>
          <p>
            Correct bid: 20 points, plus 10 points for each trick taken. Incorrect bid: lose 10 points for each trick over
            or under the bid.
          </p>
        </details>

        <details className="rules-section">
          <summary>Length Of Game</summary>
          <p>
            There are 60 cards in the deck. Play continues until the round in which all cards are dealt: 3 players play 20
            rounds, 4 play 15 rounds, 5 play 12 rounds, and 6 play 10 rounds.
          </p>
        </details>

        <details className="rules-section">
          <summary>Optional Bidding Variations</summary>
          <ul>
            <li>Hidden Bid: all players reveal bids simultaneously.</li>
            <li>Delayed Reveal Bid: players record bids, then reveal after the hand.</li>
            <li>Optional Canadian Rule: the last bidder cannot make total bids equal available tricks, unless tied for lead.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
