import Phaser from "phaser";

import { StateMachine } from "../utils/StateMachine";

enum VerticalMovementState {
  STANDING = "STANDING",
  PRE_JUMPING = "PRE_JUMPING",
  JUMPING = "JUMPING",
  FLIPPING = "FLIPPING",
  FALLING = "FALLING",
}

enum HorizontalMovementState {
  STILL = "STILL",
  TO_LEFT = "TO_LEFT",
  TO_RIGHT = "TO_RIGHT",
}

export enum AnimationState {
  IDLE = "IDLE",
  PIVOT = "PIVOT",
  RUNNING = "RUNNING",
  JUMPING = "JUMPING",
  FLIPPING = "FLIPPING",
  FALLING = "FALLING",
}

export default class Hero extends Phaser.GameObjects.Sprite {
  private verticalMovementSM = new StateMachine(
    VerticalMovementState.STANDING
    //(e) => console.log("Hero.VerticalMovementSM state change", e)
  );
  private horizontalMovementSM = new StateMachine(
    HorizontalMovementState.STILL
    //(e) => console.log("Hero.HorizontalMovementSM state change", e)
  );
  private animationSM = new StateMachine(AnimationState.IDLE, (e) =>
    console.log("Hero.AnimationSM state change", e)
  );

  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private didPressJump: boolean = false;
  private isOnFloor: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: number,
    private onAnimationStateChange: (state: AnimationState) => void,
    cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    super(scene, x, y, texture, frame);

    this.cursorKeys = cursorKeys;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body;

    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error(
        "Hero class expected the Arcade physics engine to be available."
      );
    }

    this.setupPhysics(body);
    this.setupHorizontalMovement(body);
    this.setupVerticalMovement(body);
    this.setupAnimation(body);
  }

  private setupPhysics(body: Phaser.Physics.Arcade.Body) {
    body.setCollideWorldBounds(true);
    body.setSize(15, 40);
    body.setOffset(12, 23);
    body.setMaxVelocity(250, 400);
    body.setDragX(750);
  }

  private setupHorizontalMovement(body: Phaser.Physics.Arcade.Body) {
    this.horizontalMovementSM.addState(HorizontalMovementState.STILL, {
      onEnter: () => {
        body.setAccelerationX(0);
      },
    });
    this.horizontalMovementSM.addState(HorizontalMovementState.TO_LEFT, {
      onEnter: () => {
        body.setAccelerationX(-1000);
        this.setFlipX(true);
        body.setOffset(5, 23);
      },
    });
    this.horizontalMovementSM.addState(HorizontalMovementState.TO_RIGHT, {
      onEnter: () => {
        body.setAccelerationX(1000);
        this.setFlipX(false);
        body.setOffset(12, 23);
      },
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.STILL, HorizontalMovementState.TO_RIGHT],
      to: HorizontalMovementState.TO_LEFT,
      condition: () =>
        !!this.cursorKeys?.left.isDown && !!this.cursorKeys?.right.isUp,
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.STILL, HorizontalMovementState.TO_LEFT],
      to: HorizontalMovementState.TO_RIGHT,
      condition: () =>
        !!this.cursorKeys?.right.isDown && !!this.cursorKeys?.left.isUp,
    });

    this.horizontalMovementSM.addTransitions({
      from: [HorizontalMovementState.TO_LEFT, HorizontalMovementState.TO_RIGHT],
      to: HorizontalMovementState.STILL,
      condition: () =>
        !!this.cursorKeys?.left.isUp && !!this.cursorKeys?.right.isUp,
    });

    this.horizontalMovementSM.update();
  }

  private setupVerticalMovement(body: Phaser.Physics.Arcade.Body) {
    this.verticalMovementSM.addState(VerticalMovementState.STANDING, {});
    this.verticalMovementSM.addState(VerticalMovementState.PRE_JUMPING, {
      onEnter: () => body.setVelocityY(-400),
    });
    this.verticalMovementSM.addState(VerticalMovementState.JUMPING, {
      onUpdate: () => {
        const isPressJump =
          this.cursorKeys?.up.isDown || this.cursorKeys?.space.isDown;

        if (!isPressJump && body.velocity.y < -150) {
          // Cut speed to allow short jumps after quick key release.
          body.setVelocityY(-150);
        }
      },
    });
    this.verticalMovementSM.addState(VerticalMovementState.FLIPPING, {
      onEnter: () => body.setVelocityY(-300),
    });
    this.verticalMovementSM.addState(VerticalMovementState.FALLING, {});

    this.verticalMovementSM.addTransition({
      from: VerticalMovementState.STANDING,
      to: VerticalMovementState.PRE_JUMPING,
      condition: () => this.isOnFloor && this.didPressJump,
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

    const runningStates = [
      HorizontalMovementState.TO_LEFT,
      HorizontalMovementState.TO_RIGHT,
    ];
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
        runningStates.includes(this.horizontalMovementSM.state) &&
        body.velocity.x !== 0,
    });

    this.animationSM.addTransitions({
      from: [AnimationState.RUNNING, AnimationState.FALLING],
      to: AnimationState.PIVOT,
      condition: () =>
        this.verticalMovementSM.state === VerticalMovementState.STANDING &&
        this.horizontalMovementSM.state === HorizontalMovementState.STILL,
    });

    const jumpingStates = [
      VerticalMovementState.JUMPING,
      VerticalMovementState.PRE_JUMPING,
    ];
    this.animationSM.addTransitions({
      from: [AnimationState.IDLE, AnimationState.RUNNING, AnimationState.PIVOT],
      to: AnimationState.JUMPING,
      condition: () => jumpingStates.includes(this.verticalMovementSM.state),
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

    if (!(this.body instanceof Phaser.Physics.Arcade.Body) || !this.cursorKeys)
      return;

    this.didPressJump =
      Phaser.Input.Keyboard.JustDown(this.cursorKeys.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);

    this.isOnFloor = this.body.onFloor();

    this.horizontalMovementSM.update();
    this.verticalMovementSM.update();
    this.animationSM.update();
  }
}
