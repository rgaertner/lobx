export declare type SelfContext<T = unknown> = { self: T };

export type SelfInjectedAction<T = unknown> = (
  ctx: SelfContext<T>,
  ...args: unknown[]
) => unknown;
export type SelfInjectorAction<T = unknown> = (
  ...args: unknown[]
) => SelfInjectedAction<T>;

export function SelfInjector(): SelfInjectorAction {
  return (cb: SelfInjectedAction) => {
    return function(ctx: {}, ...args: unknown[]) {
      return cb({ self: this }, ...args);
    };
  };
}
