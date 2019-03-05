declare type ActionFunction = (...args: unknown[]) => unknown;

interface ActionContext {
  readonly self: unknown;
  readonly action: {
    readonly fn: ActionFunction;
    readonly args?: unknown[];
  };
}

declare type ChainFunction = (ac: ActionContext, chain: ActiveChain) => unknown;

class ActiveChain {
  private readonly chain: ChainFunction[];
  private idx: number = 0;

  constructor(chain: ChainFunction[]) {
    this.chain = chain;
  }

  public next(ac: ActionContext): unknown {
    const current = this.chain[this.idx++];
    return current(ac, this);
  }
}

function trace(
  my: unknown,
  self: unknown,
  fnName: string,
  ...args: unknown[]
): void {
  if (typeof my === 'function' && (my as any).hasOwnProperty('mock')) {
    (my as jest.Mock)(self, fnName, ...args);
  }
}

function doFunkyStuff(ac: ActionContext, chain: ActiveChain): unknown {
  trace(ac.self, this, 'doFunkyStuffBefore');
  (ac as any).uhu = 4;
  const ret = chain.next(ac);
  trace(ac.self, this, 'doFunkyStuffAfter', ret);
  return ret;
}

function callActionFunction(ac: ActionContext, chain: ActiveChain): unknown {
  trace(ac.self, this, 'callActionFunctionBefore');
  const ret = ac.action.fn.apply(ac.self, ac.action.args);
  trace(ac.self, this, 'callActionFunctionAfter', ret);
  return ret;
}

function action(cb: ActionFunction): ActionFunction {
  const doNotMutate = [doFunkyStuff, callActionFunction];
  return function(...args) {
    const chain = new ActiveChain(doNotMutate);
    const ret = chain.next({
      self: this,
      action: {
        fn: cb,
        args: args
      }
    });
    return ret;
  };
}

test('simple action', () => {
  const fn = jest.fn();
  function realAction(a: number, b: number): number {
    trace(this, this, 'realAction', a, b);
    return a + b;
  }
  const myAction = action(realAction);
  debugger;
  const ret = myAction.apply(fn, [1, 2]);
  expect(ret).toBe(3);
  // expect(fn.mock.calls[0]).toEqual([fn, 'action', 'beforeRunChain', 1, 2]);
  expect(fn.mock.calls[0]).toEqual([global, 'doFunkyStuffBefore']);
  expect(fn.mock.calls[1]).toEqual([global, 'callActionFunctionBefore']);
  expect(fn.mock.calls[2]).toEqual([fn, 'realAction', 1, 2]);
  expect(fn.mock.calls[3]).toEqual([global, 'callActionFunctionAfter', 3]);
  expect(fn.mock.calls[4]).toEqual([global, 'doFunkyStuffAfter', 3]);
  // expect(fn.mock.calls[6]).toEqual([fn, 'action', 'afterRunChain', 1, 2, 3]);
});

test('do not mutate the action chain', () => {
  const fn = jest.fn();
  function realAction(a: number, b: number): number {
    trace(this, this, 'realAction', a, b);
    return a + b;
  }
  const myAction = action(realAction);
  // this call is for the non mutated actionChain testing
  expect(myAction.apply('hoho', [1, 2])).toBe(3);
  const ret = myAction.apply(fn, [1, 2]);
  expect(ret).toBe(3);
  // expect(fn.mock.calls[0]).toEqual([fn, 'action', 'beforeRunChain', 1, 2]);
  expect(fn.mock.calls[0]).toEqual([global, 'doFunkyStuffBefore']);
  expect(fn.mock.calls[1]).toEqual([global, 'callActionFunctionBefore']);
  expect(fn.mock.calls[2]).toEqual([fn, 'realAction', 1, 2]);
  expect(fn.mock.calls[3]).toEqual([global, 'callActionFunctionAfter', 3]);
  expect(fn.mock.calls[4]).toEqual([global, 'doFunkyStuffAfter', 3]);
  // expect(fn.mock.calls[6]).toEqual([fn, 'action', 'afterRunChain', 1, 2, 3]);
});

test('is next called', () => {
  const actionChain = new ActiveChain([]);
  actionChain.next = jest.fn();
  const ctx: ActionContext = {
    self: undefined,
    action: {
      fn: undefined
    }
  };
  doFunkyStuff({ ...ctx }, actionChain);
  expect(actionChain.next).toBeCalled();
  expect((actionChain.next as jest.Mock).mock.calls[0][0]).toEqual({
    ...ctx,
    uhu: 4
  });
});

let myActionMock = jest.fn();
interface testAction {
  (cb: ActionFunction): ActionFunction;
  // (name: string): (target: any, prop: string, descriptor: TypedPropertyDescriptor<Function>) => void;
  (
    target: any,
    prop: string,
    descriptor: TypedPropertyDescriptor<Function>
  ): void;
}

function myShell(cb: ActionFunction): ActionFunction {
  const ret = function(...args: unknown[]): unknown {
    return cb.apply(this, args);
  };
  ret.myShell = true;
  return ret;
}

function myTestAction(...args: any[]): unknown {
  myActionMock(args);
  if (
    args.length == 3 &&
    typeof args[0] === 'object' &&
    args[0].hasOwnProperty('constructor') &&
    typeof args[0].constructor.name === 'string' &&
    typeof args[1] === 'string' &&
    typeof args[2] === 'object' &&
    typeof args[2].value === 'function'
  ) {
    args[2].value = myShell(args[2].value);
    console.log('decorate', args);
    return args[2];
  }
  console.log('normal', args);
  return function(my: unknown[]) {
    console.log('called', args);
    return args[0].apply(this, my);
  };
}

const testAction = myTestAction as testAction;

class TestDecorators {
  @testAction
  public toDecorate(i: string) {
    return i + 42;
  }
}

test.only('decorate', () => {
  debugger;
  expect(myActionMock.mock.calls.length).toBe(1);
  expect((TestDecorators.prototype.toDecorate as any).myShell).toBe(true);
  const d = new TestDecorators();
  expect((d.toDecorate as any).myShell).toBe(true);
  const ret = d.toDecorate('jo');
  expect(myActionMock.mock.calls.length).toBe(1);
  expect(ret).toBe('jo42');
});
