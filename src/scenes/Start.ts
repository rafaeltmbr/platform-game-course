import Phaser from "phaser";

import heroIdleSprite from "../assets/hero/idle.png";
import heroRunSprite from "../assets/hero/run.png";
import heroPivotSprite from "../assets/hero/pivot.png";
import heroJumpSprite from "../assets/hero/jump.png";
import heroFlipSprite from "../assets/hero/spinjump.png";
import heroFallSprite from "../assets/hero/fall.png";

import Hero, { AnimationState } from "../entities/Hero";

export class Start extends Phaser.Scene {
  private player!: Hero;
  private fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.spritesheet("hero-idle-sprite", heroIdleSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("hero-run-sprite", heroRunSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("hero-pivot-sprite", heroPivotSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("hero-jump-sprite", heroJumpSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("hero-flip-sprite", heroFlipSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("hero-fall-sprite", heroFallSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create() {
    const cursorKeys = this.input.keyboard?.createCursorKeys();

    this.anims.create({
      key: "hero-idle",
      frames: this.anims.generateFrameNumbers("hero-idle-sprite"),
    });

    this.anims.create({
      key: "hero-running",
      frames: this.anims.generateFrameNumbers("hero-run-sprite"),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "hero-pivoting",
      frames: this.anims.generateFrameNumbers("hero-pivot-sprite"),
    });

    this.anims.create({
      key: "hero-jumping",
      frames: this.anims.generateFrameNumbers("hero-jump-sprite"),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "hero-flipping",
      frames: this.anims.generateFrameNumbers("hero-flip-sprite"),
      frameRate: 30,
      repeat: -1,
    });

    this.anims.create({
      key: "hero-falling",
      frames: this.anims.generateFrameNumbers("hero-fall-sprite"),
      frameRate: 10,
      repeat: -1,
    });

    this.player = new Hero(
      this,
      180,
      50,
      "hero-run-sprite",
      0,
      (state) => {
        if (state === AnimationState.IDLE) {
          this.player.anims.play("hero-idle");
        } else if (state === AnimationState.RUNNING) {
          this.player.anims.play("hero-running");
        } else if (state === AnimationState.PIVOT) {
          this.player.anims.play("hero-pivoting");
        } else if (state === AnimationState.JUMPING) {
          this.player.anims.play("hero-jumping");
        } else if (state === AnimationState.FLIPPING) {
          this.player.anims.play("hero-flipping");
        } else if (state === AnimationState.FALLING) {
          this.player.anims.play("hero-falling");
        }
      },
      cursorKeys
    );

    this.fpsText = this.add.text(0, 0, "", { color: "#ffffff", fontSize: 12 });

    const platform1 = this.add.rectangle(180, 240, 150, 15, 0xf9a603);
    this.physics.add.existing(platform1, true);
    this.physics.add.collider(platform1, this.player);

    const platform2 = this.add.rectangle(460, 100, 80, 15, 0xad23ba);
    this.physics.add.existing(platform2, true);
    this.physics.add.collider(platform2, this.player);
  }

  update(time: number, delta: number) {
    const fps = Math.round(1000 / delta);
    this.fpsText.setText(`${fps} fps`);
  }
}
