import { action } from './lobx';
import { ActionFunction } from './action-chain/action-chain';

describe('action ', () => {
  class TestAction {
    public fn = jest.fn();
    public fndec = jest.fn();

    public wurst(): number {
      this.fn(this);
      return 5;
    }

    public brot(a1: number, a2: string) {
      this.fndec(this, a1, a2);
      return 6;
    }
  }

  test('check preservation of bound (this)', () => {
    const test = new TestAction();
    const result = action(test.wurst).apply(test);
    expect(result).toBe(5);
    expect(test.fn.mock.calls[0][0]).toBe(test);
    expect(test.brot(1, 'zw2i')).toBe(6);
    expect(test.fn.mock.calls[0][0]).toBe(test);
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

  test('decorate', () => {
    debugger;
    expect(myActionMock.mock.calls.length).toBe(1);
    expect((TestDecorators.prototype.toDecorate as any).myShell).toBe(true);
    const d = new TestDecorators();
    expect((d.toDecorate as any).myShell).toBe(true);
    const ret = d.toDecorate('jo');
    expect(myActionMock.mock.calls.length).toBe(1);
    expect(ret).toBe('jo42');
  });
});
