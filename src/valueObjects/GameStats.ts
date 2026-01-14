export enum GameStatus {
  PAUSED = "PAUSED",
  RUNNING = "RUNNING",
  FINNISHED = "FINNISHED",
  HERO_DEAD = "HERO_DEAD",
}

export interface GameStatsUpdate {
  status: GameStatus;
  heroHasKey: boolean;
  elapsedTimeMs: number;
  fps: number;
}

export type GameStatsEventListener = (stats: Readonly<GameStatsUpdate>) => void;

export class GameStats {
  private _status = GameStatus.PAUSED;
  private _heroHasKey = false;
  private _elapsedTimeMs = 0;
  private _fps = 0;

  private _events = new Phaser.Events.EventEmitter();

  constructor(
    status: GameStatus,
    heroHasKey: boolean,
    elapsedTimeMs: number,
    fps: number
  ) {
    this.status = status;
    this.heroHasKey = heroHasKey;
    this.elapsedTimeMs = elapsedTimeMs;
    this.fps = fps;
  }

  get status(): GameStatus {
    return this._status;
  }

  set status(value: GameStatus) {
    if (this._status === value) return;

    this._status = value;
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

  get elapsedTimeMs(): number {
    return this._elapsedTimeMs;
  }

  set elapsedTimeMs(value: number) {
    if (this._elapsedTimeMs === value) return;

    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Elapsed time (ms) should be a positive number.");
    }

    this._elapsedTimeMs = value;
    this.dispatchUpdate();
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

  private dispatchUpdate() {
    this._events.emit(
      "update",
      Object.freeze({
        status: this._status,
        heroHasKey: this._heroHasKey,
        elapsedTimeMs: this._elapsedTimeMs,
        fps: this._fps,
      } as GameStatsUpdate)
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
