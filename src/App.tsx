import { useEffect, useState } from "react";
import Phaser from "phaser";

import config from "./phaserConfig";
import "./App.css";
import { Controls } from "./components/controls";

let phaser: Phaser.Game;

function App() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (!phaser) {
      phaser = new Phaser.Game(config as any);
      setIsTouch(!!phaser.device.input.touch);
    }
  }, []);

  return (
    <>
      <div id="game-container" />
      {isTouch ? <Controls /> : null}
    </>
  );
}

export default App;
