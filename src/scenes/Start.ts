import Phaser from "phaser";

import heroIdleSprite from "../assets/hero/idle.png";
import heroRunSprite from "../assets/hero/run.png";
import heroPivotSprite from "../assets/hero/pivot.png";
import heroJumpSprite from "../assets/hero/jump.png";
import heroFlipSprite from "../assets/hero/spinjump.png";
import heroFallSprite from "../assets/hero/fall.png";
import tileMap from "../assets/tilemaps/level-1.json";
import tileSet from "../assets/tilesets/world-1.png";

import Hero, { AnimationState } from "../entities/Hero";
import phaserConfig from "../phaserConfig";

export class Start extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;
  private hero!: Hero;
  private map!: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.tilemapTiledJSON("level-1", tileMap);
    this.load.image("world-1-sheet", tileSet);

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
    this.addMap();
    this.addHero();
    this.addStats();
  }

  private addMap() {
    this.map = this.make.tilemap({ key: "level-1" });

    const groundTiles = this.map.addTilesetImage("world-1", "world-1-sheet");
    if (!groundTiles) return;
    const groundLayer = this.map.createLayer("Ground", groundTiles);
    groundLayer?.setCollision([1, 2, 4], true);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.physics.world.setBoundsCollision(true, true, false, true);

    if (phaserConfig.physics.arcade.debug) {
      const debugGraphics = this.add.graphics();
      groundLayer?.renderDebug(debugGraphics);
    }
  }

  private addHero() {
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

    const cursorKeys = this.input.keyboard?.createCursorKeys();

    this.hero = new Hero(
      this,
      16,
      240,
      "hero-run-sprite",
      0,
      (state) => {
        if (state === AnimationState.IDLE) {
          this.hero.anims.play("hero-idle");
        } else if (state === AnimationState.RUNNING) {
          this.hero.anims.play("hero-running");
        } else if (state === AnimationState.PIVOT) {
          this.hero.anims.play("hero-pivoting");
        } else if (state === AnimationState.JUMPING) {
          this.hero.anims.play("hero-jumping");
        } else if (state === AnimationState.FLIPPING) {
          this.hero.anims.play("hero-flipping");
        } else if (state === AnimationState.FALLING) {
          this.hero.anims.play("hero-falling");
        }
      },
      cursorKeys
    );

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setBounds(
      0,
      -this.map.heightInPixels,
      this.map.widthInPixels,
      this.map.heightInPixels * 2
    );

    this.physics.add.collider(
      this.hero,
      this.map.getLayer("Ground")?.tilemapLayer!
    );
  }

  private addStats() {
    this.fpsText = this.add.text(0, 0, "", { color: "#ffffff", fontSize: 12 });
    this.fpsText.setScrollFactor(0, 0);
  }

  update(time: number, delta: number) {
    const fps = Math.round(1000 / delta);
    this.fpsText.setText(`${fps} fps`);
  }
}
