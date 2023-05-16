import { createHooks } from "hookable";

export type Action<S, A extends any[] = any[], R = any> = (
  state: S,
  ...args: A
) => R;
export type Getter<S, A extends any[] = any[], R = any> = (
  state: S,
  ...args: A
) => R;

export type Store<
  A extends Record<string, Action<S>>,
  G extends Record<string, Getter<S, any[], any>>,
  S
> = {
  state: S;
  getters: {
    [K in keyof G]: G[K];
  };
  actions: {
    [K in keyof A]: A[K];
  };
  hooks: ReturnType<typeof createHooks>;
};

export type RawStore<
  A extends Record<string, Action<S>>,
  G extends Record<string, Getter<S>>,
  S
> = Omit<Store<A, G, S>, "hooks">;
