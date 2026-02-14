import React from "react";

interface RulesPanelProps {
  visible: boolean;
}

export default function RulesPanel({ visible }: RulesPanelProps): JSX.Element {
  return (
    <section className={`panel rules-panel ${visible ? "" : "hidden"}`} id="rules-panel">
      <h2>Wizard Rules</h2>

      <div className="rules-content">
        <p className="rules-intro">
          <strong>MEDIEVAL WIZARD:</strong> Card game for 3-6 players, ages 10 and up.
        </p>

        <h3>Object Of The Game</h3>
        <p>
          Correctly predict the exact number of tricks you will take in each round. You receive points for being correct,
          and the person with the most points wins.
        </p>

        <h3>The Deal</h3>
        <p>
          Determine a dealer by dealing one card to each player; high card deals first. On the first deal each player
          gets one card, then two cards on the second deal, three on the third, and so on. Deal passes left after each
          round. After the deal, turn up the next card to determine trump.
        </p>
        <p>
          If the turned card is a Jester, there is no trump for that round. If it is a Wizard, the dealer chooses one
          of the four suits as trump. On the final round, all cards are dealt and there is no trump.
        </p>

        <h3>Bidding</h3>
        <p>
          Starting to the dealer's left, each player states how many tricks they will take (zero is allowed). The scorer
          records each bid. Total bids do not need to equal available tricks unless an optional variation is being used.
        </p>

        <h3>The Play</h3>
        <p>
          Play begins left of dealer. Any card may be led. Players must follow suit if possible. If they cannot, they may
          play any card, including trump. A Wizard or Jester may be played at any time.
        </p>
        <p>
          A trick is won by: (1) first Wizard played; (2) if no Wizard, highest trump played; (3) if no trump, highest
          card of suit led. Trick winner leads next.
        </p>

        <h3>Leading Wizards Or Jesters</h3>
        <p>
          If the lead card is a Wizard, it wins the trick and any card may be played afterward. If the lead card is a
          Jester, it is a null card and suit for the trick is set by the next card played. Jesters always lose, except
          when only Jesters are played, in which case the first Jester wins.
        </p>

        <h3>Scoring</h3>
        <p>
          Correct bid: 20 points, plus 10 points for each trick taken. Incorrect bid: lose 10 points for each trick over
          or under the bid.
        </p>

        <h3>Length Of Game</h3>
        <p>
          There are 60 cards in the deck. Play continues until the round in which all cards are dealt: 3 players play 20
          rounds, 4 play 15 rounds, 5 play 12 rounds, and 6 play 10 rounds.
        </p>

        <h3>Optional Bidding Variations</h3>
        <ul>
          <li>Hidden Bid: all players reveal bids simultaneously.</li>
          <li>Delayed Reveal Bid: players record bids, then reveal after the hand.</li>
          <li>Optional Canadian Rule: the last bidder cannot make total bids equal available tricks, unless tied for lead.</li>
        </ul>
      </div>
    </section>
  );
}
