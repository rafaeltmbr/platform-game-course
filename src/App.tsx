import { useEffect, useState } from "react";
import Phaser from "phaser";

import config from "./phaserConfig";
import "./App.css";

import { Controls } from "./components/controls";
import { Banner } from "./components/banner";

import bannerImageUrl from "./assets/images/wins.gif";

let phaser: Phaser.Game;

function App() {
  const [isTouch, setIsTouch] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!phaser) {
      phaser = new Phaser.Game(config as any);
      setIsTouch(!!phaser.device.input.touch);
      phaser.events.on("finished", () => setShowBanner(true));
    }
  }, []);

  const handleBannerClose = () => {
    setShowBanner(false);
    phaser?.events.emit("reset");
  };

  return (
    <>
      <div id="game-container" />
      {isTouch ? <Controls /> : null}
      {showBanner && (
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
