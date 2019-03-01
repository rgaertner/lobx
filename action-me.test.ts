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
    trace(this, this, 'action', 'beforeRunChain', ...args);
    const chain = new ActiveChain(doNotMutate);
    const ret = chain.next({
      self: this,
      action: {
        fn: cb,
        args: args
      }
    });
    trace(this, this, 'action', 'afterRunChain', ...args, ret);
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
  expect(fn.mock.calls[0]).toEqual([fn, 'action', 'beforeRunChain', 1, 2]);
  expect(fn.mock.calls[1]).toEqual([global, 'doFunkyStuffBefore']);
  expect(fn.mock.calls[2]).toEqual([global, 'callActionFunctionBefore']);
  expect(fn.mock.calls[3]).toEqual([fn, 'realAction', 1, 2]);
  expect(fn.mock.calls[4]).toEqual([global, 'callActionFunctionAfter', 3]);
  expect(fn.mock.calls[5]).toEqual([global, 'doFunkyStuffAfter', 3]);
  expect(fn.mock.calls[6]).toEqual([fn, 'action', 'afterRunChain', 1, 2, 3]);
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
  expect(fn.mock.calls[0]).toEqual([fn, 'action', 'beforeRunChain', 1, 2]);
  expect(fn.mock.calls[1]).toEqual([global, 'doFunkyStuffBefore']);
  expect(fn.mock.calls[2]).toEqual([global, 'callActionFunctionBefore']);
  expect(fn.mock.calls[3]).toEqual([fn, 'realAction', 1, 2]);
  expect(fn.mock.calls[4]).toEqual([global, 'callActionFunctionAfter', 3]);
  expect(fn.mock.calls[5]).toEqual([global, 'doFunkyStuffAfter', 3]);
  expect(fn.mock.calls[6]).toEqual([fn, 'action', 'afterRunChain', 1, 2, 3]);
});
