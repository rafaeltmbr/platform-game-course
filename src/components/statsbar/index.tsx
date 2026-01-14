import React from "react";

import keyImageUrl from "../../assets/items/single-key.png";

import "./styles.css";

interface StatsBarProps {
  fps: number;
  heroHasKey: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ fps, heroHasKey }) => {
  return (
    <div className="statsbar">
      <div className="row">
        <p className="fps">{`${fps} fps`}</p>
      </div>
      {heroHasKey && (
        <div className="row">
          <img className="key" src={keyImageUrl} />
        </div>
      )}
    </div>
  );
};
