import React from "react";

interface AppHeaderProps {
  showHomeButton: boolean;
  onGoHome: () => void;
}

export default function AppHeader({ showHomeButton, onGoHome }: AppHeaderProps): JSX.Element {
  return (
    <header className="hero">
      <div className="hero-bar">
        {showHomeButton ? (
          <button type="button" className="btn btn-subtle btn-home" onClick={onGoHome}>
            Home
          </button>
        ) : (
          <div className="hero-home-slot" aria-hidden="true" />
        )}
        <h1 className="hero-title">Wizard Scorepad</h1>
        <div className="hero-home-slot" aria-hidden="true" />
      </div>
    </header>
  );
}
