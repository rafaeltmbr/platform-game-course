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
    elapsedTime: 0,
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

  const time = (gameStats.elapsedTime / 1000).toFixed(2);

  return (
    <>
      <div id="game-container" />
      <StatsBar
        elapsedTime={gameStats.elapsedTime}
        fps={gameStats.fps}
        heroHasKey={gameStats.heroHasKey}
      />
      {isTouch ? <Controls /> : null}
      {gameStats.isFinished && (
        <Banner
          title="Congratulations"
          description={`Game completed in ${time} ms.`}
          imageUrl={bannerImageUrl}
          onClose={handleBannerClose}
        />
      )}
    </>
  );
}

export default App;
