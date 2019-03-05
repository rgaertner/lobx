import {
  ActiveChain,
  ActionContext,
  ActionFunction,
  ChainFunction
} from './action-chain';

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

describe('action chain checks', () => {
  test('simple action', () => {
    const fn = jest.fn();
    function realAction(a: number, b: number): number {
      trace(this, this, 'realAction', a, b);
      return a + b;
    }
    const myAction = action(realAction);
    // const ret = realAction(1,2);
    const ret = myAction.apply(fn, [1, 2]);
    expect(ret).toBe(3);
    expect(fn.mock.calls[0]).toEqual([undefined, 'doFunkyStuffBefore']);
    expect(fn.mock.calls[1]).toEqual([undefined, 'callActionFunctionBefore']);
    expect(fn.mock.calls[2]).toEqual([fn, 'realAction', 1, 2]);
    expect(fn.mock.calls[3]).toEqual([undefined, 'callActionFunctionAfter', 3]);
    expect(fn.mock.calls[4]).toEqual([undefined, 'doFunkyStuffAfter', 3]);
  });
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
  expect(fn.mock.calls[0]).toEqual([undefined, 'doFunkyStuffBefore']);
  expect(fn.mock.calls[1]).toEqual([undefined, 'callActionFunctionBefore']);
  expect(fn.mock.calls[2]).toEqual([fn, 'realAction', 1, 2]);
  expect(fn.mock.calls[3]).toEqual([undefined, 'callActionFunctionAfter', 3]);
  expect(fn.mock.calls[4]).toEqual([undefined, 'doFunkyStuffAfter', 3]);
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
function emptyAction(cb: ActionFunction) {
  return function(...args: unknown[]) {
    const functions: ChainFunction[] = [];
    const chain = new ActiveChain(functions);
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

describe('compose function', () => {
  test('compose without context functions', () => {
    const logic = jest.fn(function() {
      return this;
    });
    const result = emptyAction(logic).apply('teste', [1, 2]);
    expect(result).toEqual('teste');
    expect(logic.mock.calls[0]).toEqual([1, 2]);
  });
});
