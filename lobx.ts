import { IComputed } from './i-computed';
import { IActionFactory } from './i-action';
import {
  SelfInjectedAction,
  SelfInjector
} from './self-injector/self-injector';
import { IDInjectorFactory, IDInjected } from './id-injector/id-injector';
import * as uuid from 'uuid';

export interface LobxConfig {
  readonly selfInjector?: SelfInjectedAction;
  readonly idInjector?: IDInjected<SelfInjectedAction>;
}

export type Injector = SelfInjectedAction | IDInjected<SelfInjectedAction>;

export class Lobx {
  public readonly selfInjector: SelfInjectedAction;
  public readonly idInjector: IDInjected<SelfInjectedAction>;

  public readonly actionInjectorList: Injector[];
  public readonly computedInjectorList: Injector[];

  public static buildInjectors(lst: Injector[]) {
    return function(...args: any[]) {
      let ret: unknown;
      const ctx = {};
      for (let i = 0; i < lst.length; ++i) {
        ret = lst[i](ctx, args);
      }
      return ret;
    };
  }

  public constructor(config: LobxConfig) {
    this.selfInjector = config.selfInjector || SelfInjector();
    this.idInjector = config.idInjector || IDInjectorFactory();
    this.actionInjectorList = [this.selfInjector, this.idInjector];
    this.computedInjectorList = [this.selfInjector, this.idInjector];
  }
}

interface LobxContext {
  action: IActionFactory;
  computed: IComputed;
  lobx: Lobx;
}

export function lobxFactory(props: LobxConfig = {}) {
  const lobx = new Lobx(props);
  return {
    action: Lobx.buildInjectors(lobx.actionInjectorList),
    computed: Lobx.buildInjectors(lobx.computedInjectorList),
    lobx
  };
}
export const LOBX = lobxFactory();
export const action = LOBX.action;
export const computed = LOBX.computed;
