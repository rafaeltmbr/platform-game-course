import { Start } from "./scenes/Start";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#33A5E7",
  scene: [Start],
  scale: {
    width: 500,
    height: 320,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 750 },
      debug: false,
      debugShowVelocity: true,
      debugShowBody: true,
      debugShowStaticBody: true,
    },
  },
};

export default config;
