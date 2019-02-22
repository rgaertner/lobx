import { functionComposer } from './compose-injected-functions/function-composer';
import { IActionFactory } from './i-action';
import { IComputed } from './i-computed';
import { IDInjected, IDInjectorFactory } from './id-injector/id-injector';
import {
  SelfInjectedAction,
  SelfInjectorFactory
} from './self-injector/self-injector';

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

  public action(logic: (...args: unknown[]) => unknown) {
    return functionComposer(
      logic,
      SelfInjectorFactory(),
      this.actionInjectorList
    );
  }

  public computed(logic: (...args: unknown[]) => unknown) {
    return functionComposer(
      logic,
      this.selfInjector,
      this.computedInjectorList
    );
  }

  public constructor(config: LobxConfig) {
    this.selfInjector = config.selfInjector || SelfInjectorFactory();
    this.idInjector = config.idInjector || IDInjectorFactory();
    this.actionInjectorList = [this.idInjector];
    this.computedInjectorList = [this.idInjector];
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
    action: lobx.action as IActionFactory,
    computed: lobx.computed as IComputed,
    lobx
  };
}
export const LOBX = lobxFactory();
export const action = LOBX.action;
export const computed = LOBX.computed;
