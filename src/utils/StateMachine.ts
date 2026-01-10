export interface StateEvent<T> {
  current: T;
  previous: T | null;
  next: T | null;
}

export type StateEventHandler<T> = (event: Readonly<StateEvent<T>>) => void;

export interface StateEventHandlers<T> {
  onEnter?: StateEventHandler<T>;
  onUpdate?: StateEventHandler<T>;
  onLeave?: StateEventHandler<T>;
}

export interface AddTransitionsParams<T> {
  from: T[];
  to: T;
  condition: () => boolean;
}
export interface AddTransitionParams<T> {
  from: T;
  to: T;
  condition: () => boolean;
}

interface StateTransitionSpec<T> {
  to: T;
  condition: () => boolean;
}

interface StateHandlersAndConditions<T> {
  handlers: StateEventHandlers<T>;
  transitions: StateTransitionSpec<T>[];
}

export class StateMachine<T> {
  private previous: T | null = null;
  constructor(
    private current: T,
    private onStateChange?: StateEventHandler<T>
  ) {}

  private stateHandlersAndConditionsMap = new Map<
    T,
    StateHandlersAndConditions<T>
  >();

  public get state(): T {
    return this.current;
  }

  public addState(state: T, handlers: StateEventHandlers<T>) {
    if (this.stateHandlersAndConditionsMap.has(state)) {
      throw new Error(`Handler for state '${state}' already exists.`);
    }

    this.stateHandlersAndConditionsMap.set(state, {
      handlers,
      transitions: [],
    });
  }

  public addTransition(params: AddTransitionParams<T>) {
    const handlersAndTransitions = this.stateHandlersAndConditionsMap.get(
      params.from
    );
    if (!handlersAndTransitions) {
      throw new Error(
        `Failed to add transition from '${params.from}' to '${params.to}', because state '${params.from}' does not exists.`
      );
    }

    const isDestinationStateAvailable =
      !!this.stateHandlersAndConditionsMap.get(params.to);
    if (!isDestinationStateAvailable) {
      throw new Error(
        `Failed to add transition from '${params.from}' to '${params.to}', because state '${params.to}' does not exists.`
      );
    }

    const isTransitionAlreadyAdded = !!handlersAndTransitions.transitions.find(
      (e) => e.to === params.to
    );
    if (isTransitionAlreadyAdded) {
      throw new Error(
        `Failed to add transition from '${params.from}' to '${params.to}', because such transition already exists.`
      );
    }

    handlersAndTransitions.transitions.push({
      to: params.to,
      condition: params.condition,
    });
  }

  public addTransitions(params: AddTransitionsParams<T>) {
    for (const from of params.from) {
      this.addTransition({
        from,
        to: params.to,
        condition: params.condition,
      });
    }
  }

  public update() {
    const previousHandlersAndTransitions =
      this.stateHandlersAndConditionsMap.get(this.current);
    if (!previousHandlersAndTransitions) {
      throw new Error(`Handler for state '${this.current}' does not exists.`);
    }

    const next = previousHandlersAndTransitions.transitions.find((e) =>
      e.condition()
    );
    const isTransition = !!next;

    if (isTransition) {
      const nextStateEvent: Readonly<StateEvent<T>> = Object.freeze({
        previous: this.previous,
        current: this.current,
        next: next.to,
      });
      previousHandlersAndTransitions.handlers.onLeave?.(nextStateEvent);

      this.previous = this.current;
      this.current = next.to;
    }

    const currentHandlersAndTransitions =
      this.stateHandlersAndConditionsMap.get(this.current);
    if (!currentHandlersAndTransitions) {
      throw new Error(`Handler for state '${this.current}' does not exists.`);
    }

    const stateEvent: Readonly<StateEvent<T>> = Object.freeze({
      previous: this.previous,
      current: this.current,
      next: null,
    });

    if (isTransition) {
      currentHandlersAndTransitions.handlers.onEnter?.(stateEvent);
      this.onStateChange?.(stateEvent);
    }

    currentHandlersAndTransitions.handlers.onUpdate?.(stateEvent);
  }
}
