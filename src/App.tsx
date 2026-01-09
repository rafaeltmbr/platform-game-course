import { useEffect } from "react";
import Phaser from "phaser";

import config from "./phaserConfig";
import "./App.css";

let phaser: Phaser.Game;

function App() {
  useEffect(() => {
    if (!phaser) {
      phaser = new Phaser.Game(config);
    }
  }, []);

  return <div id="game-container" />;
}

export default App;
