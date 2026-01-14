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

import keySprite from "../assets/items/key.png";

import tileMap from "../assets/tilemaps/level-1.json";
import tileSet from "../assets/tilesets/world-1.png";
import cloudsSet from "../assets/tilesets/clouds.png";
import doorSet from "../assets/tilesets/door.png";

import adventureTheme from "../assets/music/time_for_adventure.mp3";
import winnerThemeFile from "../assets/music/hino.mp3";
import jumpSoundFile from "../assets/sounds/jump.wav";
import getKeySoundFile from "../assets/sounds/coin.wav";
import heroDieSoundFile from "../assets/sounds/power_up.wav";
import enemyDieSoundFile from "../assets/sounds/explosion.wav";

import Hero, { AnimationState, type TextKeys } from "../entities/Hero";
import phaserConfig from "../phaserConfig";
import { controlsState } from "../components/controls";
import Enemy from "../entities/Enemy";
import { Key } from "../entities/Key";
import { Door } from "../entities/Door";

interface Coordinates {
  x: number;
  y: number;
}

interface StartEndCoordinates {
  start: Coordinates;
  end: Coordinates;
}

export class Start extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;
  private hero!: Hero;
  private enemies: Enemy[] = [];
  private key!: Key;
  private door!: Door;
  private map!: Phaser.Tilemaps.Tilemap;
  private spikeGroup!: Phaser.Physics.Arcade.Group;
  private heroStartCoordinates: Coordinates = { x: 0, y: 0 };
  private enemiesCoordinates: StartEndCoordinates[] = [];
  private doorCoordinates: Coordinates = { x: 0, y: 0 };
  private keyCoordinates: Coordinates = { x: 0, y: 0 };
  private adventureTheme!: Phaser.Sound.WebAudioSound;
  private winnerTheme!: Phaser.Sound.WebAudioSound;
  private jumpSound!: Phaser.Sound.WebAudioSound;
  private getKeySound!: Phaser.Sound.WebAudioSound;
  private heroDieSound!: Phaser.Sound.WebAudioSound;
  private enemyDieSound!: Phaser.Sound.WebAudioSound;
  private gotKey: boolean = false;
  private isGameFinished: boolean = false;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.audio("adventure-theme", adventureTheme);
    this.load.audio("winner-theme", winnerThemeFile);
    this.load.audio("jump", jumpSoundFile);
    this.load.audio("get-key", getKeySoundFile);
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

    this.load.spritesheet("door-sheet", doorSet, {
      frameWidth: 64,
      frameHeight: 64,
    });

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

    this.load.spritesheet("key-sprite", keySprite, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.setupAudio();
    this.setupAnimations();
    this.addMap();
    this.addDoor();
    this.addEnemies();
    this.addKey();
    this.addHero();
    this.addStats();
  }

  private setupAudio() {
    this.adventureTheme = this.sound.add("adventure-theme", {
      volume: 0.6,
      loop: true,
    }) as Phaser.Sound.WebAudioSound;

    this.winnerTheme = this.sound.add("winner-theme", {
      volume: 0.6,
      loop: true,
    }) as Phaser.Sound.WebAudioSound;

    this.jumpSound = this.sound.add("jump", {
      volume: 0.3,
    }) as Phaser.Sound.WebAudioSound;

    this.getKeySound = this.sound.add("get-key", {
      volume: 0.4,
    }) as Phaser.Sound.WebAudioSound;

    this.heroDieSound = this.sound.add("hero-die", {
      volume: 0.4,
    }) as Phaser.Sound.WebAudioSound;

    this.enemyDieSound = this.sound.add("enemy-die", {
      volume: 0.3,
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

    this.anims.create({
      key: "key-rotating",
      frames: this.anims.generateFrameNumbers("key-sprite"),
      frameRate: 12,
      repeat: -1,
    });
  }

  private addMap() {
    this.map = this.make.tilemap({ key: "level-1" });
    const cloudTiles = this.map.addTilesetImage("clouds", "clouds-sheet");
    const worldTiles = this.map.addTilesetImage("world-1", "world-1-sheet");
    const doorTiles = this.map.addTilesetImage("door", "door-sheet");
    if (!worldTiles || !cloudTiles || !doorTiles) {
      throw new Error("Tiles not loaded.");
    }

    const backgroundLayer = this.map.createLayer("Background", cloudTiles);
    backgroundLayer?.setScrollFactor(0.5);

    const groundLayer = this.map.createLayer("Ground", [worldTiles, doorTiles]);
    groundLayer?.setCollision([1, 2, 4], true);

    const heroStartingPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "HeroStartingPoint");

    if (heroStartingPoint) {
      this.heroStartCoordinates = {
        x: heroStartingPoint.x!,
        y: heroStartingPoint.y!,
      };
    }

    const enemyStartingPoints =
      this.map
        .getObjectLayer("Objects")
        ?.objects.filter((o) => o.name === "EnemyStartingPoint") ?? [];

    const enemyStartingCoordinateMap = new Map<string, Coordinates>();

    for (const startingPoint of enemyStartingPoints) {
      enemyStartingCoordinateMap.set(startingPoint.type, {
        x: startingPoint.x!,
        y: startingPoint.y!,
      });
    }

    const enemyEndingPoints =
      this.map
        .getObjectLayer("Objects")
        ?.objects.filter((o) => o.name === "EnemyEndingPoint") ?? [];

    for (const ep of enemyEndingPoints) {
      const start = enemyStartingCoordinateMap.get(ep.type);
      if (start) {
        const end = { x: ep.x!, y: ep.y! };
        this.enemiesCoordinates.push({ start, end });
      }
    }

    const doorPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "DoorPoint");

    if (doorPoint) {
      this.doorCoordinates = {
        x: doorPoint.x!,
        y: doorPoint.y!,
      };
    }

    const keyPoint = this.map
      .getObjectLayer("Objects")
      ?.objects.find((o) => o.name === "KeyPoint");

    if (keyPoint) {
      this.keyCoordinates = {
        x: keyPoint.x!,
        y: keyPoint.y!,
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

    const foreground = this.map.createLayer("Foreground", worldTiles);
    foreground?.setDepth(100);

    if (phaserConfig.physics.arcade.debug) {
      const debugGraphics = this.add.graphics();
      groundLayer?.renderDebug(debugGraphics);
    }
  }

  private addDoor() {
    this.gotKey = false;
    this.door = new Door(this, this.doorCoordinates, "door-sheet", 0);

    this.physics.add.collider(
      this.door,
      this.map.getLayer("Ground")?.tilemapLayer!
    );
  }

  private addEnemies() {
    for (const coordinate of this.enemiesCoordinates) {
      const enemy = new Enemy(
        this,
        coordinate.start,
        coordinate.end,
        "enemy-walk-sprite",
        0
      );

      enemy.anims.play("enemy-walking");

      this.physics.add.collider(
        enemy,
        this.map.getLayer("Ground")?.tilemapLayer!
      );

      enemy.on("died", () => {
        enemy.anims.play("enemy-dead");
        this.enemyDieSound.play();
      });

      this.enemies.push(enemy);
    }
  }

  private addKey() {
    this.gotKey = false;
    this.key = new Key(this, this.keyCoordinates, "key-sprite", 0);

    this.key.anims.play("key-rotating");

    this.physics.add.collider(
      this.key,
      this.map.getLayer("Ground")?.tilemapLayer!
    );
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

        if (!this.adventureTheme.isPlaying && !this.isGameFinished) {
          this.adventureTheme.play();
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

    const spikesCollider = this.physics.add.overlap(
      this.hero,
      this.spikeGroup,
      () => this.hero.kill()
    );

    const enemyColliders = this.enemies.map((enemy) =>
      this.physics.add.overlap(enemy, this.hero, () => {
        if (enemy.isDead) return;

        const heroCenterY = this.hero.getBounds().centerY;
        const enemyCenterY = enemy.getBounds().centerY;
        const enemyHalfHeight = enemy.getBounds().height / 2;

        if (heroCenterY < enemyCenterY - enemyHalfHeight) {
          enemy.kill();
        } else {
          this.hero.kill();
        }
      })
    );

    const doorCollider = this.physics.add.overlap(this.hero, this.door, () => {
      if (this.gotKey && !this.isGameFinished) {
        doorCollider.active = false;
        this.hero.visible = false;
        this.hero.active = false;
        this.hero.active = false;
        this.cameras.main.stopFollow();
        this.game.events.emit("finished");
        this.adventureTheme.stop();
        this.winnerTheme.play();
        this.isGameFinished = true;
      }
    });

    this.game.events.on("reset", this.reset.bind(this));

    const keyCollider = this.physics.add.overlap(this.hero, this.key, () => {
      this.gotKey = true;
      this.getKeySound.play();
      this.key.visible = false;
      keyCollider.active = false;
    });

    this.hero.on("died", () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      enemyColliders.forEach((collider) => collider.destroy());
      doorCollider.destroy();
      keyCollider.destroy();
      this.adventureTheme.stop();
      this.isGameFinished = true;
      this.cameras.main.stopFollow();
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
      this.reset();
    }
  }

  private reset() {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.key.destroy();
    this.hero.destroy();
    this.addKey();
    this.addEnemies();
    this.addHero();
    this.isGameFinished = false;
    if (this.winnerTheme.isPlaying) {
      this.winnerTheme.stop();
    }
  }
}
