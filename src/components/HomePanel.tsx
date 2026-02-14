import React from "react";

interface HomePanelProps {
  visible: boolean;
  hasSavedGame: boolean;
  onContinue: () => void;
  onStartNew: () => void;
  onReadRules: () => void;
}

export default function HomePanel({ visible, hasSavedGame, onContinue, onStartNew, onReadRules }: HomePanelProps): JSX.Element {
  return (
    <section className={`panel ${visible ? "" : "hidden"}`} id="home-panel">
      <h2>Home</h2>
      <p className="helper">Choose to continue the current game or start a new one.</p>
      <div className="home-actions">
        <button type="button" className="btn btn-primary" onClick={onContinue} disabled={!hasSavedGame}>
          Continue Current Game
        </button>
        <button type="button" className="btn" onClick={onStartNew}>
          Start New Game
        </button>
        <button type="button" className="btn" onClick={onReadRules}>
          Read Rules
        </button>
      </div>
    </section>
  );
}
