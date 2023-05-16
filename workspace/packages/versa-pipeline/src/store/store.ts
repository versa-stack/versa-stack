import { createHooks } from "hookable";
import { Action, Getter, RawStore, Store } from "./model";

type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;

const storeRecord: Record<string, any> = {};

export const createStore = <
  A extends Record<string, Action<S>>,
  G extends Record<string, Getter<S>>,
  S
>(
  name: string,
  input: RawStore<A, G, S>
) =>
  (storeRecord[name] = {
    actions: wrapActions<S, A>(name, input.actions as any),
    getters: wrapGetters<S, G>(name, input.getters as any),
    hooks: createHooks(),
    state: input.state,
  });

const wrapActions = <S, A extends Record<string, Action<S>>>(
  name: string,
  actions: A
): {
  [K in keyof A]: (...args: Tail<Parameters<A[K]>>) => ReturnType<A[K]>;
} => {
  const wrappedActions = {} as {
    [K in keyof A]: (...args: Tail<Parameters<A[K]>>) => ReturnType<A[K]>;
  };

  for (const key in actions) {
    const action = actions[key];
    wrappedActions[key] = (...args: Tail<Parameters<A[typeof key]>>) => {
      storeRecord[name].hooks.callHook(key, ...args);
      return action(storeRecord[name].state, ...args);
    };
  }

  return wrappedActions;
};

const wrapGetters = <S, G extends Record<string, Getter<S>>>(
  name: string,
  getters: G
): { [K in keyof G]: () => ReturnType<G[K]> } => {
  const wrappedGetters: { [K in keyof G]: () => ReturnType<G[K]> } = {} as {
    [K in keyof G]: () => ReturnType<G[K]>;
  };

  for (const key in getters) {
    const getter = getters[key];
    wrappedGetters[key] = () => getter(storeRecord[name].state);
  }

  return wrappedGetters;
};
