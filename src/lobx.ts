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

function createTopChain(
  cb: ActionFunction,
  chain: ChainFunction[]
): ActionFunction {
  const topChain = function(...args: any[]) {
    const aChain = new ActiveChain(chain);
    const ret = aChain.next({
      self: this,
      action: {
        fn: cb,
        args: args
      }
    });
    if (!(topChain as any).hasOwnProperty('__lobx')) {
      (topChain as any).__lobx = {
        wrapped: cb
      };
    }
    return ret;
  };
  return topChain;
}

export class Lobx {
  public readonly idInjector: ChainFunction;
  public readonly lobXRefInjector: ChainFunction;

  public readonly actionInjectorList: ChainFunction[];
  public readonly computedInjectorList: ChainFunction[];

  public readonly actionChain: ChainFunction[];
  public readonly computedGetChain: ChainFunction[];
  public readonly computedSetChain: ChainFunction[];

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
    this.computedGetChain = [
      this.idInjector,
      this.lobXRefInjector,
      ...this.computedInjectorList
    ];
    this.computedSetChain = [
      this.idInjector,
      this.lobXRefInjector,
      ...this.computedInjectorList
    ];
    this.actionHandler = this.createActionChain(this.actionChain);
    this.computedHandler = this.createComputedChain(
      this.computedGetChain,
      this.computedSetChain
    );
  }

  public createActionChain(chain: ChainFunction[]) {
    return function(...args: any[]): ActionFunction {
      if (
        args.length == 3 &&
        typeof args[0] === 'object' &&
        args[0].hasOwnProperty('constructor') &&
        typeof args[0].constructor.name === 'string' &&
        typeof args[1] === 'string' &&
        typeof args[2] === 'object' &&
        typeof args[2].value === 'function'
      ) {
        const topChain = createTopChain(args[2].value, chain);
        args[2].value = topChain;
        return args[2];
      }
      return createTopChain(args[0], chain);
    };
  }

  public createComputedChain(
    getChain: ChainFunction[],
    setChain: ChainFunction[]
  ) {
    return function(...args: any[]): ActionFunction {
      const descriptor = args[2];
      if (
        args.length == 3 &&
        typeof args[0] === 'object' &&
        args[0].hasOwnProperty('constructor') &&
        typeof args[0].constructor.name === 'string' &&
        typeof args[1] === 'string' &&
        typeof descriptor === 'object' &&
        (typeof descriptor.get === 'function' ||
          typeof descriptor.set === 'function')
      ) {
        if (descriptor.get) {
          descriptor.get = createTopChain(descriptor.get, getChain);
        }
        if (descriptor.set) {
          descriptor.set = createTopChain(descriptor.set, setChain);
        }
        return descriptor;
      }

      return createTopChain(args[0], getChain);
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
