import Phaser from "phaser";

import { StateMachine } from "../utils/StateMachine";
import type { ControlsState } from "../components/controls";

const COYOTE_JUMP_WINDOW_FRAMES = 10;
const JUMP_BUFFER_WINDOW_FRAMES = 10;

enum VerticalMovementState {
  STANDING = "STANDING",
  PRE_JUMPING = "PRE_JUMPING",
  JUMPING = "JUMPING",
  FLIPPING = "FLIPPING",
  FALLING = "FALLING",
  DEAD = "DEAD",
}

enum HorizontalMovementState {
  STILL = "STILL",
  TO_LEFT = "TO_LEFT",
  TO_RIGHT = "TO_RIGHT",
  DEAD = "DEAD",
}

export enum AnimationState {
  IDLE = "IDLE",
  PIVOT = "PIVOT",
  RUNNING = "RUNNING",
  JUMPING = "JUMPING",
  FLIPPING = "FLIPPING",
  FALLING = "FALLING",
  DEAD = "DEAD",
}

export interface TextKeys {
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
}

export default class Hero extends Phaser.GameObjects.Sprite {
  private verticalMovementSM = new StateMachine(VerticalMovementState.STANDING);
  private horizontalMovementSM = new StateMachine(
    HorizontalMovementState.STILL
  );
  private animationSM = new StateMachine(AnimationState.IDLE);

  private didPressJump: boolean = false;
  private isOnFloor: boolean = false;
  private _isDead: boolean = false;
  private coyoteJumpCountdown: number = 0;
  private jumpBufferCountdown: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: number,
    private onAnimationStateChange: (state: AnimationState) => void,
    private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys,
    private textKeys?: TextKeys,
    private controlsState?: ControlsState
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body;

    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error(
        "Hero class expected the Arcade physics engine to be available."
      );
    }

    this.setOrigin(0.5, 1);
    this.setupPhysics(body);
    this.setupHorizontalMovement(body);
    this.setupVerticalMovement(body);
    this.setupAnimation(body);
  }

  public get isDead() {
    return this._isDead;
  }

  private setupPhysics(body: Phaser.Physics.Arcade.Body) {
    body.setCollideWorldBounds(true);
    body.setSize(15, 40);
    body.setOffset(10, 23);
    body.setMaxVelocity(250, 400);
    body.setDragX(750);
  }

  private setupHorizontalMovement(body: Phaser.Physics.Arcade.Body) {
    this.horizontalMovementSM.addState(HorizontalMovementState.DEAD, {
      onEnter: () => {
        body.setAccelerationX(0);
      },
    });

    this.horizontalMovementSM.addState(HorizontalMovementState.STILL, {
      onEnter: () => {
        body.setAccelerationX(0);
      },
    });
    this.horizontalMovementSM.addState(HorizontalMovementState.TO_LEFT, {
      onEnter: () => {
        body.setAccelerationX(-1000);
        this.setFlipX(true);
        body.setOffset(8, 23);
      },
    });
    this.horizontalMovementSM.addState(HorizontalMovementState.TO_RIGHT, {
      onEnter: () => {
        body.setAccelerationX(1000);
        this.setFlipX(false);
        body.setOffset(10, 23);
      },
    });

    this.horizontalMovementSM.addTransitions({
      from: [
        HorizontalMovementState.STILL,
        HorizontalMovementState.TO_LEFT,
        HorizontalMovementState.TO_RIGHT,
      ],
      to: HorizontalMovementState.DEAD,
      condition: () => this._isDead,
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.STILL, HorizontalMovementState.TO_RIGHT],
      to: HorizontalMovementState.TO_LEFT,
      condition: () => {
        const isLeftDown =
          !!this.cursorKeys?.left.isDown ||
          !!this.textKeys?.a.isDown ||
          !!this.controlsState?.isLeft;

        const isRightUp =
          !!this.cursorKeys?.right.isUp &&
          !!this.textKeys?.d.isUp &&
          !this.controlsState?.isRight;

        return isLeftDown && isRightUp;
      },
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.STILL, HorizontalMovementState.TO_LEFT],
      to: HorizontalMovementState.TO_RIGHT,
      condition: () => {
        const isRightDown =
          !!this.cursorKeys?.right.isDown ||
          !!this.textKeys?.d.isDown ||
          !!this.controlsState?.isRight;

        const isLeftUp =
          !!this.cursorKeys?.left.isUp &&
          !!this.textKeys?.a.isUp &&
          !this.controlsState?.isLeft;

        return isRightDown && isLeftUp;
      },
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.TO_LEFT, HorizontalMovementState.TO_RIGHT],
      to: HorizontalMovementState.STILL,
      condition: () => {
        const isLeftUp =
          !!this.cursorKeys?.left.isUp &&
          !!this.textKeys?.a.isUp &&
          !this.controlsState?.isLeft;

        const isRightUp =
          !!this.cursorKeys?.right.isUp &&
          !!this.textKeys?.d.isUp &&
          !this.controlsState?.isRight;

        return isLeftUp && isRightUp;
      },
    });

    this.horizontalMovementSM.update();
  }

  private setupVerticalMovement(body: Phaser.Physics.Arcade.Body) {
    this.verticalMovementSM.addState(VerticalMovementState.DEAD, {
      onEnter: () => body.setVelocityY(-500),
    });

    this.verticalMovementSM.addState(VerticalMovementState.STANDING, {});

    this.verticalMovementSM.addState(VerticalMovementState.PRE_JUMPING, {
      onEnter: () => {
        body.setVelocityY(-450);
        this.coyoteJumpCountdown = 0;
        this.jumpBufferCountdown = 0;
      },
    });

    this.verticalMovementSM.addState(VerticalMovementState.JUMPING, {
      onUpdate: () => {
        const isPressJump =
          this.cursorKeys?.up.isDown ||
          this.cursorKeys?.space.isDown ||
          this.textKeys?.w.isDown ||
          this.controlsState?.isUp;

        if (!isPressJump && body.velocity.y < -150) {
          // Cut speed to allow short jumps after quick key release.
          body.setVelocityY(-150);
        }
      },
    });

    this.verticalMovementSM.addState(VerticalMovementState.FLIPPING, {
      onEnter: () => {
        body.setVelocityY(-300);
        this.jumpBufferCountdown = 0;
      },
    });

    this.verticalMovementSM.addState(VerticalMovementState.FALLING, {});

    this.verticalMovementSM.addTransitions({
      from: [
        VerticalMovementState.STANDING,
        VerticalMovementState.PRE_JUMPING,
        VerticalMovementState.JUMPING,
        VerticalMovementState.FLIPPING,
        VerticalMovementState.FALLING,
      ],
      to: VerticalMovementState.DEAD,
      condition: () => this._isDead,
    });

    this.verticalMovementSM.addTransitions({
      from: [VerticalMovementState.STANDING, VerticalMovementState.FALLING],
      to: VerticalMovementState.PRE_JUMPING,
      condition: () =>
        this.coyoteJumpCountdown > 0 && this.jumpBufferCountdown > 0,
    });

    this.verticalMovementSM.addTransition({
      from: VerticalMovementState.PRE_JUMPING,
      to: VerticalMovementState.JUMPING,
      condition: () => body.velocity.y < 0,
    });

    this.verticalMovementSM.addTransition({
      from: VerticalMovementState.STANDING,
      to: VerticalMovementState.FALLING,
      condition: () => !this.isOnFloor,
    });

    this.verticalMovementSM.addTransition({
      from: VerticalMovementState.JUMPING,
      to: VerticalMovementState.FLIPPING,
      condition: () => this.didPressJump,
    });

    this.verticalMovementSM.addTransitions({
      from: [
        VerticalMovementState.JUMPING,
        VerticalMovementState.FLIPPING,
        VerticalMovementState.FALLING,
      ],
      to: VerticalMovementState.STANDING,
      condition: () => this.isOnFloor,
    });

    this.verticalMovementSM.update();
  }

  private setupAnimation(body: Phaser.Physics.Arcade.Body) {
    this.animationSM.addState(AnimationState.DEAD, {
      onEnter: () => this.onAnimationStateChange(AnimationState.DEAD),
    });

    this.animationSM.addState(AnimationState.IDLE, {
      onEnter: () => this.onAnimationStateChange(AnimationState.IDLE),
    });

    this.animationSM.addState(AnimationState.RUNNING, {
      onEnter: () => this.onAnimationStateChange(AnimationState.RUNNING),
    });

    this.animationSM.addState(AnimationState.PIVOT, {
      onEnter: () => this.onAnimationStateChange(AnimationState.PIVOT),
    });

    this.animationSM.addState(AnimationState.JUMPING, {
      onEnter: () => this.onAnimationStateChange(AnimationState.JUMPING),
    });

    this.animationSM.addState(AnimationState.FLIPPING, {
      onEnter: () => this.onAnimationStateChange(AnimationState.FLIPPING),
    });

    this.animationSM.addState(AnimationState.FALLING, {
      onEnter: () => this.onAnimationStateChange(AnimationState.FALLING),
    });

    this.animationSM.addTransitions({
      from: [
        AnimationState.IDLE,
        AnimationState.PIVOT,
        AnimationState.RUNNING,
        AnimationState.JUMPING,
        AnimationState.FLIPPING,
        AnimationState.FALLING,
      ],
      to: AnimationState.DEAD,
      condition: () => this._isDead,
    });

    this.animationSM.addTransitions({
      from: [
        AnimationState.PIVOT,
        AnimationState.RUNNING,
        AnimationState.JUMPING,
        AnimationState.FLIPPING,
        AnimationState.FALLING,
      ],
      to: AnimationState.IDLE,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.STANDING &&
        body.velocity.x === 0,
    });

    this.animationSM.addTransitions({
      from: [
        AnimationState.IDLE,
        AnimationState.PIVOT,
        AnimationState.JUMPING,
        AnimationState.FLIPPING,
        AnimationState.FALLING,
      ],
      to: AnimationState.RUNNING,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.STANDING &&
        Math.sign(body.velocity.x) === (this.flipX ? -1 : 1) &&
        body.velocity.x !== 0,
    });

    this.animationSM.addTransitions({
      from: [AnimationState.RUNNING, AnimationState.FALLING],
      to: AnimationState.PIVOT,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.STANDING &&
        Math.sign(body.velocity.x) === (this.flipX ? 1 : -1),
    });

    const jumpingStates = [
      VerticalMovementState.JUMPING,
      VerticalMovementState.PRE_JUMPING,
    ];
    this.animationSM.addTransitions({
      from: [
        AnimationState.IDLE,
        AnimationState.RUNNING,
        AnimationState.PIVOT,
        AnimationState.FALLING,
      ],
      to: AnimationState.JUMPING,
      condition: () =>
        jumpingStates.includes(this.verticalMovementSM.state) &&
        body.velocity.y < 0,
    });

    this.animationSM.addTransition({
      from: AnimationState.JUMPING,
      to: AnimationState.FLIPPING,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.FLIPPING,
    });

    this.animationSM.addTransition({
      from: AnimationState.FALLING,
      to: AnimationState.FLIPPING,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.FLIPPING &&
        body.velocity.y <= 0,
    });

    this.animationSM.addTransitions({
      from: [
        AnimationState.IDLE,
        AnimationState.PIVOT,
        AnimationState.RUNNING,
        AnimationState.JUMPING,
        AnimationState.FLIPPING,
      ],
      to: AnimationState.FALLING,
      condition: () => body.velocity.y > 0,
    });
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!(this.body instanceof Phaser.Physics.Arcade.Body)) return;

    if (this.cursorKeys && this.textKeys) {
      this.didPressJump =
        Phaser.Input.Keyboard.JustDown(this.cursorKeys.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursorKeys.space) ||
        Phaser.Input.Keyboard.JustDown(this.textKeys.w);
    }

    if (this.controlsState) {
      this.didPressJump = this.didPressJump || this.controlsState.didPressUp;
      this.controlsState.didPressUp = false;
    }

    this.isOnFloor = this.body.onFloor();

    this.coyoteJumpCountdown = this.isOnFloor
      ? COYOTE_JUMP_WINDOW_FRAMES
      : Math.max(this.coyoteJumpCountdown - 1, 0);

    this.jumpBufferCountdown = this.didPressJump
      ? JUMP_BUFFER_WINDOW_FRAMES
      : Math.max(this.jumpBufferCountdown - 1, 0);

    this.horizontalMovementSM.update();
    this.verticalMovementSM.update();
    this.animationSM.update();
  }

  public kill() {
    if (!this._isDead) {
      this._isDead = true;
      this.emit("died");

      if (this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.setCollideWorldBounds(false);
      }
    }
  }
}
