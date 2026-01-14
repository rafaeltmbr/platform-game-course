import Phaser from "phaser";

import { StateMachine } from "../utils/StateMachine";

export enum EnemyMovement {
  IDLE = "IDLE",
  DEAD = "DEAD",
  TO_LEFT = "TO_LEFT",
  TO_RIGHT = "TO_RIGHT",
}

interface Coordinates {
  x: number;
  y: number;
}

export default class Enemy extends Phaser.GameObjects.Sprite {
  private movementSM = new StateMachine(EnemyMovement.IDLE);
  private _isDead: boolean = false;
  private isPaused: boolean = true;

  constructor(
    scene: Phaser.Scene,
    private startPoint: Coordinates,
    private endPoint: Coordinates,
    texture: string,
    frame: number
  ) {
    super(scene, startPoint.x, startPoint.y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);

    if (!(this.body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error("Expected Arcade engine to be available");
    }

    this.body.setSize(24, 24);
    this.body.setOffset(4, 8);
    this.body.setMaxVelocity(200, 300);
    this.body.setDrag(750);

    this.setupMovement(this.body);
  }

  get isDead(): boolean {
    return this._isDead;
  }

  run() {
    this.isPaused = false;
  }

  private setupMovement(body: Phaser.Physics.Arcade.Body) {
    this.movementSM.addState(EnemyMovement.IDLE, {
      onEnter: () => {
        body.setVelocityX(0);
      },
    });

    this.movementSM.addState(EnemyMovement.DEAD, {
      onEnter: () => {
        body.setVelocityX(0);
      },
    });

    this.movementSM.addState(EnemyMovement.TO_RIGHT, {
      onEnter: () => {
        this.setFlipX(false);
      },
      onUpdate: () => {
        body.setVelocityX(50);
      },
    });

    this.movementSM.addState(EnemyMovement.TO_LEFT, {
      onEnter: () => {
        this.setFlipX(true);
      },
      onUpdate: () => {
        body.setVelocityX(-50);
      },
    });

    this.movementSM.addTransitions({
      from: [EnemyMovement.TO_LEFT, EnemyMovement.TO_RIGHT],
      to: EnemyMovement.IDLE,
      condition: () => this.isPaused,
    });

    this.movementSM.addTransition({
      from: EnemyMovement.IDLE,
      to: EnemyMovement.TO_RIGHT,
      condition: () => !this.isPaused,
    });

    this.movementSM.addTransitions({
      from: [EnemyMovement.TO_LEFT, EnemyMovement.TO_RIGHT],
      to: EnemyMovement.DEAD,
      condition: () => this._isDead,
    });

    this.movementSM.addTransition({
      from: EnemyMovement.TO_LEFT,
      to: EnemyMovement.TO_RIGHT,
      condition: () => {
        const { centerX } = this.getBounds();
        return centerX < this.startPoint.x;
      },
    });

    this.movementSM.addTransition({
      from: EnemyMovement.TO_RIGHT,
      to: EnemyMovement.TO_LEFT,
      condition: () => {
        const { centerX } = this.getBounds();
        return centerX > this.endPoint.x;
      },
    });
  }

  public kill() {
    if (!this._isDead) {
      this._isDead = true;
      this.emit("died");
    }
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.movementSM.update();
  }
}
