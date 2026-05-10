import React from "react";
import { ScreenMode } from "../types";

interface AppHeaderProps {
  showHomeButton: boolean;
  onGoHome: () => void;
  screenMode: ScreenMode;
}

export default function AppHeader({
  showHomeButton,
  onGoHome,
  screenMode,
}: AppHeaderProps): JSX.Element {
  return (
    <header className="hero">
      <div className="hero-bar">
        <div className="hero-copy">
          <h1 className="hero-title">Wizard Scorepad</h1>
        </div>
        <div className="hero-actions">
          {showHomeButton ? (
            <button type="button" className="btn btn-subtle btn-home" onClick={onGoHome}>
              Home
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
