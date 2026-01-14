import Phaser from "phaser";

interface Coordinates {
  x: number;
  y: number;
}

export class Door extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    coordinates: Coordinates,
    texture: string,
    frame: number
  ) {
    super(scene, coordinates.x, coordinates.y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);

    if (this.body instanceof Phaser.Physics.Arcade.StaticBody) {
      this.body.setSize(32, 48);
      this.body.setOffset(16, -16);
    }
  }
}
