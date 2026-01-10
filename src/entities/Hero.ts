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

export default class Hero extends Phaser.GameObjects.Sprite {
  private verticalMovementSM = new StateMachine(
    VerticalMovementState.STANDING,
    (e) => console.log("VerticalMovementSM state change", e)
  );
  private horizontalMovementSM = new StateMachine(
    HorizontalMovementState.STILL,
    (e) => console.log("HorizontalMovementSM state change", e)
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
  }
}
