import { IComputed } from './i-computed';
import { IActionFactory } from './i-action';

export class Lobx {
  public actionHandler(my: any, fn: IActionFactory) {
    return function(...args: any[]) {
      return fn.apply(my, args);
    };
  }

  public computedHandler(my: any, fn: IComputed) {
    return function(...args: any[]) {
      return fn.apply(my, args);
    };
  }
}

interface LobxContext {
  action: IActionFactory;
  computed: IComputed;
  lobx: Lobx;
}

export function lobxFactory() {
  const lobx = new Lobx();
  return {
    action: (function(fn: IActionFactory) {
      return lobx.actionHandler(this, fn);
    } as unknown) as IActionFactory,
    computed: (function(fn: IComputed) {
      return lobx.computedHandler(this, fn);
    } as unknown) as IComputed,
    lobx
  };
}
export const LOBX = lobxFactory();
export const action = LOBX.action;
export const computed = LOBX.computed;
