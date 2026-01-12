import Phaser from "phaser";

import heroIdleSprite from "../assets/hero/idle.png";
import heroRunSprite from "../assets/hero/run.png";
import heroPivotSprite from "../assets/hero/pivot.png";
import heroJumpSprite from "../assets/hero/jump.png";
import heroFlipSprite from "../assets/hero/spinjump.png";
import heroFallSprite from "../assets/hero/fall.png";
import heroDeadSprite from "../assets/hero/bonk.png";

import enemyWalkSprite from "../assets/baddies/totem_walk.png";
import enemyDieSprite from "../assets/baddies/totem_die.png";

import tileMap from "../assets/tilemaps/level-1.json";
import tileSet from "../assets/tilesets/world-1.png";
import cloudsSet from "../assets/tilesets/clouds.png";

import themeSoundFile from "../assets/music/time_for_adventure.mp3";
import jumpSoundFile from "../assets/sounds/jump.wav";
import pivotSoundFile from "../assets/sounds/tap.wav";
import heroDieSoundFile from "../assets/sounds/power_up.wav";
import enemyDieSoundFile from "../assets/sounds/explosion.wav";

import Hero, { AnimationState, type TextKeys } from "../entities/Hero";
import phaserConfig from "../phaserConfig";
import { controlsState } from "../components/controls";
import Enemy from "../entities/Enemy";

interface Coordinates {
  x: number;
  y: number;
}

export class Start extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;
  private hero!: Hero;
  private enemy!: Enemy;
  private map!: Phaser.Tilemaps.Tilemap;
  private spikeGroup!: Phaser.Physics.Arcade.Group;
  private heroStartCoordinates: Coordinates = { x: 0, y: 0 };
  private enemyStartCoordinates: Coordinates = { x: 0, y: 0 };
  private enemyEndCoordinates: Coordinates = { x: 0, y: 0 };
  private themeSound!: Phaser.Sound.WebAudioSound;
  private jumpSound!: Phaser.Sound.WebAudioSound;
  private pivotSound!: Phaser.Sound.WebAudioSound;
  private heroDieSound!: Phaser.Sound.WebAudioSound;
  private enemyDieSound!: Phaser.Sound.WebAudioSound;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.audio("theme", themeSoundFile);
    this.load.audio("jump", jumpSoundFile);
    this.load.audio("pivot", pivotSoundFile);
    this.load.audio("hero-die", heroDieSoundFile);
    this.load.audio("enemy-die", enemyDieSoundFile);

    this.sound.pauseOnBlur = true;

    this.load.tilemapTiledJSON("level-1", tileMap);

    this.load.spritesheet("world-1-sheet", tileSet, {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });

    this.load.image("clouds-sheet", cloudsSet);

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

    this.load.spritesheet("hero-dead-sprite", heroDeadSprite, {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet("enemy-walk-sprite", enemyWalkSprite, {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("enemy-die-sprite", enemyDieSprite, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.setupAudio();
    this.setupAnimations();
    this.addMap();
    this.addEnemy();
    this.addHero();
    this.addStats();
  }

  private setupAudio() {
    this.themeSound = this.sound.add("theme", {
      volume: 0.4,
      loop: true,
    }) as Phaser.Sound.WebAudioSound;
    this.jumpSound = this.sound.add("jump", {
      volume: 0.15,
    }) as Phaser.Sound.WebAudioSound;
    this.pivotSound = this.sound.add("pivot", {
      volume: 0.1,
    }) as Phaser.Sound.WebAudioSound;
    this.heroDieSound = this.sound.add("hero-die", {
      volume: 0.2,
    }) as Phaser.Sound.WebAudioSound;
    this.enemyDieSound = this.sound.add("enemy-die", {
      volume: 0.15,
    }) as Phaser.Sound.WebAudioSound;
  }

  private setupAnimations() {
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

    this.anims.create({
      key: "hero-dead",
      frames: this.anims.generateFrameNumbers("hero-dead-sprite"),
    });

    this.anims.create({
      key: "enemy-walking",
      frames: this.anims.generateFrameNumbers("enemy-walk-sprite"),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-dead",
      frames: this.anims.generateFrameNumbers("enemy-die-sprite"),
      frameRate: 10,
    });
  }

  private addMap() {
    this.map = this.make.tilemap({ key: "level-1" });
    const cloudTiles = this.map.addTilesetImage("clouds", "clouds-sheet");
    const worldTiles = this.map.addTilesetImage("world-1", "world-1-sheet");
    if (!worldTiles || !cloudTiles) {
      throw new Error("Tiles not loaded.");
    }

    const backgroundLayer = this.map.createLayer("Background", cloudTiles);
    backgroundLayer?.setScrollFactor(0.5);

    const groundLayer = this.map.createLayer("Ground", worldTiles);
    groundLayer?.setCollision([1, 2, 4], true);

    const heroStartingPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "StartingPoint");

    if (heroStartingPoint) {
      this.heroStartCoordinates = {
        x: heroStartingPoint.x!,
        y: heroStartingPoint.y!,
      };
    }

    const enemyStartingPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "EnemyStartingPoint");

    if (enemyStartingPoint) {
      this.enemyStartCoordinates = {
        x: enemyStartingPoint.x!,
        y: enemyStartingPoint.y!,
      };
    }

    const enemyEndingPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "EnemyEndingPoint");

    if (enemyEndingPoint) {
      this.enemyEndCoordinates = {
        x: enemyEndingPoint.x!,
        y: enemyEndingPoint.y!,
      };
    }

    this.spikeGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });
    const spikes =
      this.map.getObjectLayer("Objects")?.objects.filter((o) => o.gid === 7) ??
      [];

    for (const spike of spikes) {
      const spikeObject = this.spikeGroup.create(
        spike.x,
        spike.y,
        "world-1-sheet",
        spike.gid! - 1
      );
      spikeObject.setOrigin(0, 1);
      spikeObject.setSize(spike.width! - 6, spike.height! - 8);
      spikeObject.setOffset(3, 8);
    }

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.physics.world.setBoundsCollision(true, true, false, true);

    this.map.createLayer("Foreground", worldTiles);

    if (phaserConfig.physics.arcade.debug) {
      const debugGraphics = this.add.graphics();
      groundLayer?.renderDebug(debugGraphics);
    }
  }

  private addHero() {
    const cursorKeys = this.input.keyboard?.createCursorKeys();
    const textKeys: TextKeys | undefined = this.input.keyboard
      ? {
          a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        }
      : undefined;

    this.hero = new Hero(
      this,
      this.heroStartCoordinates.x,
      this.heroStartCoordinates.y,
      "hero-run-sprite",
      0,
      (state) => {
        if (state === AnimationState.IDLE) {
          this.hero.anims.play("hero-idle");
        } else if (state === AnimationState.RUNNING) {
          this.hero.anims.play("hero-running");
        } else if (state === AnimationState.PIVOT) {
          this.hero.anims.play("hero-pivoting");
          this.pivotSound.play();
        } else if (state === AnimationState.JUMPING) {
          this.hero.anims.play("hero-jumping");
          this.jumpSound.play();
        } else if (state === AnimationState.FLIPPING) {
          this.hero.anims.play("hero-flipping");
          this.jumpSound.play();
        } else if (state === AnimationState.FALLING) {
          this.hero.anims.play("hero-falling");
        } else if (state == AnimationState.DEAD) {
          this.hero.anims.play("hero-dead");
          this.heroDieSound.play();
        }

        if (!this.themeSound.isPlaying) {
          this.themeSound.play();
        }
      },
      cursorKeys,
      textKeys,
      controlsState
    );

    this.cameras.main.startFollow(this.hero);
    this.cameras.main.setBounds(
      0,
      -this.map.heightInPixels,
      this.map.widthInPixels,
      this.map.heightInPixels * 2
    );

    const groundCollider = this.physics.add.collider(
      this.hero,
      this.map.getLayer("Ground")?.tilemapLayer!
    );

    this.children.moveTo(
      this.hero,
      this.children.getIndex(this.map.getLayer("Foreground")!.tilemapLayer)
    );

    const spikesCollider = this.physics.add.overlap(
      this.hero,
      this.spikeGroup,
      () => this.hero.kill()
    );

    const enemyCollider = this.physics.add.overlap(
      this.enemy,
      this.hero,
      () => {
        if (this.enemy.isDead) return;

        const heroCenterY = this.hero.getBounds().centerY;
        const enemyCenterY = this.enemy.getBounds().centerY;
        const enemyHalfHeight = this.enemy.getBounds().height / 2;

        if (heroCenterY < enemyCenterY - enemyHalfHeight) {
          this.enemy.kill();
        } else {
          this.hero.kill();
        }
      }
    );

    this.hero.on("died", () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      enemyCollider.destroy();
      this.cameras.main.stopFollow();
    });
  }

  private addEnemy() {
    this.enemy = new Enemy(
      this,
      this.enemyStartCoordinates,
      this.enemyEndCoordinates,
      "enemy-walk-sprite",
      0
    );

    this.enemy.anims.play("enemy-walking");

    this.physics.add.collider(
      this.enemy,
      this.map.getLayer("Ground")?.tilemapLayer!
    );

    this.enemy.on("died", () => {
      this.enemy.anims.play("enemy-dead");
      this.enemyDieSound.play();
    });
  }

  private addStats() {
    this.fpsText = this.add.text(0, 0, "", { color: "#ffffff", fontSize: 12 });
    this.fpsText.setScrollFactor(0, 0);
  }

  update(_: number, delta: number) {
    const fps = Math.round(1000 / delta);
    this.fpsText.setText(`${fps} fps`);

    const camera = this.cameras.main;
    const cameraBottom = camera.getWorldPoint(0, camera.height).y;

    if (this.hero.isDead && this.hero.getBounds().top > cameraBottom + 100) {
      this.enemy.destroy();
      this.hero.destroy();
      this.addEnemy();
      this.addHero();
    }
  }
}
