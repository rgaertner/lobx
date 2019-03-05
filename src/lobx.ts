import { IActionFactory } from './i-action';
import { IComputed } from './i-computed';
import { IDInjectorFactory } from './id-injector/id-injector';
import { LobxRefInjectorFactory } from './id-injector/lobx-ref-injector';
import {
  ChainFunction,
  ActionFunction,
  ActiveChain,
  LobxRef
} from './action-chain/action-chain';

export interface LobxConfig {
  readonly selfInjector?: ChainFunction;
  readonly idInjector?: ChainFunction;
  readonly lobxRefInjector?: ChainFunction;
}

interface ActionDecorator {
  (cb: ActionFunction): ActionFunction;
  // (name: string): (target: any, prop: string, descriptor: TypedPropertyDescriptor<Function>) => void;
  (
    target: any,
    prop: string,
    descriptor: TypedPropertyDescriptor<Function>
  ): void;
}

function actionDecorator(...args: any[]): unknown {
  if (
    args.length == 3 &&
    typeof args[0] === 'object' &&
    args[0].hasOwnProperty('constructor') &&
    typeof args[0].constructor.name === 'string' &&
    typeof args[1] === 'string' &&
    typeof args[2] === 'object' &&
    typeof args[2].value === 'function'
  ) {
    args[2].value = LOBX.action(args[2].value);
    return args[2];
  }
  return function(my: unknown[]) {
    return args[0].apply(this, my);
  };
}

export const actiondec = actionDecorator as ActionDecorator;
export class Lobx {
  public readonly idInjector: ChainFunction;
  public readonly lobXRefInjector: ChainFunction;

  public readonly actionInjectorList: ChainFunction[];
  public readonly computedInjectorList: ChainFunction[];

  public readonly actionChain: ChainFunction[];
  public readonly computedChain: ChainFunction[];

  public constructor(config: LobxConfig) {
    this.idInjector = config.idInjector || IDInjectorFactory();
    this.lobXRefInjector = config.lobxRefInjector || LobxRefInjectorFactory();
    this.actionInjectorList = [this.lobXRefInjector];
    this.computedInjectorList = [this.lobXRefInjector];
    this.actionChain = [
      this.idInjector,
      this.lobXRefInjector,
      ...this.actionInjectorList
    ];
    this.computedChain = [
      this.idInjector,
      this.lobXRefInjector,
      ...this.computedInjectorList
    ];
    this.actionHandler = this.createChain(this.actionChain);
    this.computedHandler = this.createChain(this.computedChain);
  }

  public createChain(chain: ChainFunction[]) {
    return function(cb: ActionFunction): ActionFunction {
      const topChain = function(...args: unknown[]) {
        const aChain = new ActiveChain(chain);
        const ret = aChain.next({
          self: this,
          action: {
            fn: cb,
            args: args
          }
        });
        debugger;
        if (!(topChain as any).hasOwnProperty('__lobx')) {
          (topChain as any).__lobx = {
            wrapped: cb
          };
        }
        return ret;
      };
      return topChain;
    };
  }

  public actionHandler(cb: ActionFunction) {
    throw new Error('never call that!');
  }
  public computedHandler(cb: ActionFunction) {
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
