import { Hookable, createHooks } from "hookable";
import { filterSensitiveData } from "../filterSensitiveData";

export type AppliedAction<T = any> = (...args: T[]) => T;

export type State = Record<string, any>;

export type Action<T = any> = (state: State, ...args: T[]) => T;

export type Getter<T = any> = (state: State) => T;

export type AppliedGetter<T = any> = (...args: any[]) => T;

export type RawStore<
  S = State,
  A = Record<string, AppliedAction>,
  G = Record<string, AppliedGetter>
> = {
  actions?: A;
  getters?: G;
  state: S;
};

export type Store<
  S = State,
  A = Record<string, AppliedAction>,
  G = Record<string, AppliedGetter>
> = Required<RawStore<S, A, G>> & {
  hooks: Hookable;
};

export const createGetters = <
  S extends State = State,
  A extends Record<string, AppliedAction> = Record<string, AppliedAction>,
  G extends Record<string, AppliedGetter> = Record<string, AppliedGetter>
>(
  store: Store<S, A, G>,
  getters: Record<string, Getter>
) => {
  const appliedGetters: Record<string, AppliedGetter> = {} as Record<
    string,
    AppliedGetter
  >;
  Object.entries(getters).forEach(([name, getter]) => {
    appliedGetters[name] = getter(store.state);
  });

  return appliedGetters;
};

export const createActions = <
  S extends State = State,
  A extends Record<string, AppliedAction> = Record<string, AppliedAction>,
  G extends Record<string, AppliedGetter> = Record<string, AppliedGetter>
>(
  store: Store<S, A, G>,
  actions: Record<string, Action>
) => {
  const appliedActions: Record<string, AppliedAction> = {};
  Object.entries(actions).forEach(([name, action]) => {
    appliedActions[name] = (...args: any[]) => {
      store.hooks.callHook(name, ...filterSensitiveData(args));
      return action(store.state, ...args);
    };
  });

  return appliedActions;
};

export const createStore = <
  S extends State = State,
  A extends Record<string, AppliedAction> = Record<string, AppliedAction>,
  G extends Record<string, AppliedGetter> = Record<string, AppliedGetter>
>(
  state: S,
  actions: Record<string, Action>,
  getters: Record<string, Getter>
): Store<S, A, G> => {
  const store = {
    state,
    actions: {} as A,
    getters: {} as G,
    hooks: createHooks(),
  } as Store<S, A, G>;

  store.actions = createActions<S, A, G>(store, actions) as A;
  store.getters = createGetters<S, A, G>(store, getters) as G;

  return store as Store<S, A, G>;
};
