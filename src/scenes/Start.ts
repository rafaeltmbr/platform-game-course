import Phaser from "phaser";

import heroRunSprite from "../assets/hero/run.png";
import Hero from "../entities/Hero";

export class Start extends Phaser.Scene {
  private player!: Hero;
  private fpsText!: Phaser.GameObjects.Text;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.spritesheet("hero-run-sprite", heroRunSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create() {
    this.cursorKeys = this.input.keyboard?.createCursorKeys();

    this.anims.create({
      key: "hero-running",
      frames: this.anims.generateFrameNumbers("hero-run-sprite"),
      frameRate: 10,
      repeat: -1,
    });

    this.player = new Hero(
      this,
      250,
      160,
      "hero-run-sprite",
      0,
      this.cursorKeys
    );
    this.player.anims.play("hero-running");

    this.fpsText = this.add.text(0, 0, "", { color: "#ffffff", fontSize: 12 });

    const platform1 = this.add.rectangle(200, 240, 150, 15, 0x9d8e21);
    this.physics.add.existing(platform1, true);
    this.physics.add.collider(platform1, this.player);

    const platform2 = this.add.rectangle(460, 80, 80, 15, 0xad23ba);
    this.physics.add.existing(platform2, true);
    this.physics.add.collider(platform2, this.player);
  }

  update(time: number, delta: number) {
    const fps = Math.round(1000 / delta);
    this.fpsText.setText(`${fps} fps`);
  }
}
