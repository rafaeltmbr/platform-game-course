import Phaser from "phaser";

export default class Hero extends Phaser.GameObjects.Sprite {
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private canDoubleJump: boolean = false;
  private isJumping: boolean = false;

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

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setCollideWorldBounds(true);
      this.body.setSize(15, 40);
      this.body.setOffset(12, 23);
      this.body.setMaxVelocity(250, 400);
      this.body.setDragX(750);
    }
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!(this.body instanceof Phaser.Physics.Arcade.Body) || !this.cursorKeys)
      return;

    if (this.cursorKeys.left.isDown) {
      this.body.setAccelerationX(-1000);
      this.setFlipX(true);
      this.body.setOffset(5, 23);
    } else if (this.cursorKeys.right.isDown) {
      this.body.setAccelerationX(1000);
      this.setFlipX(false);
      this.body.setOffset(12, 23);
    } else {
      this.body.setAccelerationX(0);
    }

    if (this.body.onFloor()) {
      this.canDoubleJump = false;
    }

    if (this.body.velocity.y < 0) {
      this.isJumping = false;
    }

    const didPressJump =
      Phaser.Input.Keyboard.JustDown(this.cursorKeys.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);

    const isPressJump =
      this.cursorKeys.up.isDown || this.cursorKeys.space.isDown;

    if (didPressJump && this.body.onFloor()) {
      this.isJumping = true;
      this.canDoubleJump = true;
      this.body.setVelocityY(-400);
    } else if (didPressJump && this.canDoubleJump) {
      this.isJumping = true;
      this.canDoubleJump = false;
      this.body.setVelocityY(-300);
    }

    if (!isPressJump && this.body.velocity.y < -150 && this.isJumping) {
      this.body.setVelocityY(-150);
    }
  }
}
