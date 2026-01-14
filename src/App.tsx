import { useEffect, useState } from "react";
import Phaser from "phaser";

import config from "./phaserConfig";
import "./App.css";

import { Controls } from "./components/controls";
import { Banner } from "./components/banner";

import bannerImageUrl from "./assets/images/wins.gif";
import type { GameStatsUpdate } from "./valueObjects/GameStats";
import { StatsBar } from "./components/statsbar";

let phaser: Phaser.Game;

function App() {
  const [isTouch, setIsTouch] = useState(false);
  const [gameStats, setGameStats] = useState<GameStatsUpdate>({
    fps: 0,
    isFinished: false,
    heroHasKey: false,
  });

  useEffect(() => {
    if (!phaser) {
      phaser = new Phaser.Game(config as any);
      setIsTouch(!!phaser.device.input.touch);
      phaser.events.on("game-stats", (stats: Readonly<GameStatsUpdate>) =>
        setGameStats(stats)
      );
    }
  }, []);

  const handleBannerClose = () => {
    phaser?.events.emit("reset");
  };

  return (
    <>
      <div id="game-container" />
      <StatsBar fps={gameStats.fps} heroHasKey={gameStats.heroHasKey} />
      {isTouch ? <Controls /> : null}
      {gameStats.isFinished && (
        <Banner
          title="GG WP"
          description="Thanks for playing!"
          imageUrl={bannerImageUrl}
          onClose={handleBannerClose}
        />
      )}
    </>
  );
}

export default App;
