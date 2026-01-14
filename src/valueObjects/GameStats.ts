export interface GameStatsUpdate {
  fps: number;
  isFinished: boolean;
  heroHasKey: boolean;
}

export type GameStatsEventListener = (stats: Readonly<GameStatsUpdate>) => void;

export class GameStats {
  private _fps = 0;
  private _isFinished = false;
  private _heroHasKey = false;

  private _events = new Phaser.Events.EventEmitter();

  constructor(fps: number, isFinished: boolean, heroHasKey: boolean) {
    this.fps = fps;
    this.isFinished = isFinished;
    this.heroHasKey = heroHasKey;
  }

  get fps(): number {
    return this._fps;
  }

  set fps(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("FPS must be a posivite integer.");
    }

    if (value === this._fps) return;

    this._fps = value;
    this.dispatchUpdate();
  }

  get isFinished(): boolean {
    return this._isFinished;
  }

  set isFinished(value: boolean) {
    if (typeof this._isFinished !== "boolean") {
      throw new Error("isFinished must be a boolean.");
    }

    if (this._isFinished === value) return;

    this._isFinished = value;
    this.dispatchUpdate();
  }

  get heroHasKey(): boolean {
    return this._heroHasKey;
  }

  set heroHasKey(value: boolean) {
    if (typeof this._heroHasKey !== "boolean") {
      throw new Error("heroHasKey must be a boolean.");
    }

    if (this._heroHasKey === value) return;

    this._heroHasKey = value;
    this.dispatchUpdate();
  }

  private dispatchUpdate() {
    this._events.emit(
      "update",
      Object.freeze({
        fps: this._fps,
        isFinished: this.isFinished,
        heroHasKey: this.heroHasKey,
      })
    );
  }

  public addEventListener(listener: GameStatsEventListener): void {
    this._events.addListener("update", listener);
  }

  public removeEventListener(listener: GameStatsEventListener): void {
    this._events.removeListener("update", listener);
  }

  public removeAllListeners(): void {
    this._events.removeAllListeners();
  }
}
