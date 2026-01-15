import { useEffect, useState } from "react";
import Phaser from "phaser";

import config from "./phaserConfig";
import "./App.css";

import { Controls } from "./components/controls";
import { Banner } from "./components/banner";

import finnishedGameImage from "./assets/images/wins.gif";
import pausedGameImage from "./assets/images/controls.png";

import { GameStatus, type GameStatsUpdate } from "./valueObjects/GameStats";
import { StatsBar } from "./components/statsbar";
import { Fullscreen } from "./components/fullscreen";

let phaser: Phaser.Game;

function App() {
  const [isTouch, setIsTouch] = useState(false);
  const [gameStats, setGameStats] = useState<GameStatsUpdate>({
    status: GameStatus.PAUSED,
    heroHasKey: false,
    elapsedTimeMs: 0,
    fps: 0,
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

  const time = (gameStats.elapsedTimeMs / 1000).toFixed(2);

  return (
    <>
      <div id="game-container" />
      <StatsBar
        elapsedTime={gameStats.elapsedTimeMs}
        fps={gameStats.fps}
        heroHasKey={gameStats.heroHasKey}
      />
      <Fullscreen />
      {isTouch ? <Controls /> : null}
      {gameStats.status === GameStatus.PAUSED && (
        <Banner
          title="MOVEMENT CONTROLS"
          description="Press any movement key to start the game."
          imageUrl={pausedGameImage}
        />
      )}
      {gameStats.status === GameStatus.FINNISHED && (
        <Banner
          title="Congratulations"
          description={`Game completed in ${time} s.`}
          imageUrl={finnishedGameImage}
          onClose={handleBannerClose}
        />
      )}
    </>
  );
}

export default App;
