import Phaser from "phaser";

import spaceImage from "../assets/space.png";
import logo from "../assets/logo.png";
import spaceshipSprite from "../assets/spaceship.png";

export class Start extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.image("background", spaceImage);
    this.load.image("logo", logo);

    //  The ship sprite is CC0 from https://ansimuz.itch.io - check out his other work!
    this.load.spritesheet("ship", spaceshipSprite, {
      frameWidth: 176,
      frameHeight: 96,
    });
  }

  create() {
    this.background = this.add.tileSprite(640, 360, 1280, 720, "background");

    this.add.image(640, 180, "logo");

    const ship = this.add.sprite(640, 360, "ship");

    ship.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("ship", { start: 0, end: 2 }),
      frameRate: 15,
      repeat: -1,
    });

    ship.play("fly");

    this.tweens.add({
      targets: ship,
      y: 400,
      duration: 1000,
      ease: "Sine.inOut",
      yoyo: true,
      loop: -1,
    });
  }

  update() {
    this.background.tilePositionX += 4;
  }
}
