import { ContextComposerFunction } from '../compose-injected-functions/function-composer';

export declare type SelfContext<T = unknown> = { self: T };

export type SelfInjectedAction<T = unknown> = (
  ...args: unknown[]
) => ContextComposerFunction;
export type SelfInjectorAction<T = unknown> = (
  ...args: unknown[]
) => SelfInjectedAction<T>;

export function SelfInjectorFactory(): SelfInjectorAction {
  return (cb: SelfInjectedAction) => {
    return function(...args: unknown[]) {
      return cb({ self: this }, ...args);
    };
  };
}
