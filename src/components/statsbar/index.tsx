import React from "react";

import keyImageUrl from "../../assets/items/single-key.png";

import "./styles.css";

interface StatsBarProps {
  elapsedTime: number;
  fps: number;
  heroHasKey: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  elapsedTime,
  fps,
  heroHasKey,
}) => {
  const time = (elapsedTime / 1000).toFixed(2);

  return (
    <div className="statsbar">
      <div className="row">
        <p className="text">{`${time} ms`}</p>
      </div>
      <div className="row">
        <p className="text">{`${fps} fps`}</p>
      </div>
      {heroHasKey && (
        <div className="row">
          <img className="key" src={keyImageUrl} />
        </div>
      )}
    </div>
  );
};
