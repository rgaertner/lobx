import { IActionFactory } from './i-action';
import { IComputed } from './i-computed';
import { IDInjectorFactory } from './id-injector/id-injector';
import { LobxRefInjectorFactory } from './id-injector/lobx-ref-injector';
import { isNull } from 'util';
import {
  ChainFunction,
  ActionFunction,
  ActiveChain
} from './action-chain/action-chain';

export interface LobxConfig {
  readonly selfInjector?: ChainFunction;
  readonly idInjector?: ChainFunction;
  readonly lobxRefInjector?: ChainFunction;
}

export class Lobx {
  public readonly idInjector: ChainFunction;
  public readonly lobXRefInjector: ChainFunction;

  public readonly actionInjectorList: ChainFunction[];
  public readonly computedInjectorList: ChainFunction[];
  public computedHandler = (logic: (...args: unknown[]) => unknown) => isNull;
  // functionComposer(this.computedSelfInjector(logic), this.computedInjectorList);

  public constructor(config: LobxConfig) {
    debugger;
    this.idInjector = config.idInjector || IDInjectorFactory();
    this.lobXRefInjector = config.lobxRefInjector || LobxRefInjectorFactory();
    this.actionInjectorList = [this.lobXRefInjector];
    this.computedInjectorList = [this.lobXRefInjector];
    const chain = new ActiveChain([
      this.idInjector,
      this.lobXRefInjector,
      ...this.actionInjectorList
    ]);
    debugger;
    this.actionHandler = this.setChain(chain);
  }

  private setChain(chain: ActiveChain) {
    return function(cb: ActionFunction): ActionFunction {
      return function(...args) {
        const ret = chain.next({
          self: this,
          action: {
            fn: cb,
            args: args
          }
        });
        return ret;
      };
    };
  }

  public actionHandler(cb: ActionFunction) {
    throw new Error('never call that!');
  }
}

interface LobxContext {
  action: IActionFactory;
  computed: IComputed;
  lobx: Lobx;
}

export function lobxFactory(props: LobxConfig = {}): LobxContext {
  const lobx = new Lobx(props);
  return {
    action: lobx.actionHandler as IActionFactory,
    computed: lobx.computedHandler as IComputed,
    lobx
  };
}
export const LOBX = lobxFactory();
export const action = LOBX.action;
export const computed = LOBX.computed;
