import Phaser from "phaser";

interface Coordinates {
  x: number;
  y: number;
}

export class Door extends Phaser.Physics.Arcade.Sprite {
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
    this.setSize(32, 48);
    this.setOffset(16, -16);
  }
}
