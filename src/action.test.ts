import { action, lobxFactory, LOBX } from './lobx';
import { IActionFactory } from './i-action';
import { LobxRefInjectorFactory } from './id-injector/lobx-ref-injector';
import { IDCountingGenerator } from './id-generator/id-counting-generator';
import { LobxRef, ActionFunction } from './action-chain/action-chain';

describe('action ', () => {
  test('existence of action method', () => {
    const fn: () => void = jest.fn();
    action(fn)();
    expect(fn).toHaveBeenCalled();
  });

  test('check return type of passed function to be returned by action', () => {
    expect(action(() => 5)()).toBe(5);
  });

  test('check arguments are passed to function', () => {
    expect(action((x: number) => x + 5)(3)).toBe(8);
  });

  function gurke(...args: unknown[]) {
    console.log(this);
    return function(
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ): string {
      console.log('called', arguments);
      return (target[propertyKey] as any).value.apply(target);
    };
  }
  class TestAction {
    public constructor() {
      this.origBrot = this.brot;
      this.brot = action(this.brot);
    }
    public fn = jest.fn();

    public wurst(): number {
      this.fn(this);
      return 5;
    }

    public origBrot(a1: number, a2: string) {}

    public brot = (a1: number, a2: string) => {
      this.fn(this, a1, a2);
      return 6;
    };
    @action
    public kaese(test: string) {
      return test;
    }
  }

  test('check preservation of bound (this)', () => {
    const test = new TestAction();
    test.wurst();
    expect(test.fn.mock.calls[0][0].fn).toBe(test.fn);
  });

  test('passing arguments to bound method', () => {
    const test = new TestAction();
    test.brot(1, 'eins');
    console.log(test.brot.toString());
    expect(typeof ((test.origBrot as unknown) as LobxRef).__lobx).toBe(
      'object'
    );
    expect(typeof ((test as unknown) as LobxRef).__lobx).toBe('object');
    expect(test.fn.mock.calls[0]).toEqual([test, 1, 'eins']);
  });

  test('test kaese', () => {
    const test = new TestAction();
    const input = 'kaesebrot';
    const orig = test.kaese;
    const ret = orig(input);
    console.log(test.brot.toString());
    expect(ret).toBe(input);
    expect((orig as any).__lobx.wrapped.__lobx.id.length).toBeGreaterThan(10);
    // expect((orig as any).__lobx.action.fn.__lobx.id.length).toBeGreaterThan(10);
  });
  test('check global lobx context', () => {
    const lobxContext = lobxFactory();
    const fn = jest.fn();
    const original = lobxContext.action;
    lobxContext.action = (function(my: any) {
      fn(this, my);
      return original.apply(this, [my]);
    } as unknown) as IActionFactory;
    const fn3 = () => {};
    lobxContext.action(fn3)();
    expect(fn.mock.calls[0]).toEqual([lobxContext, fn3]);
  });
  test('count invocation references', () => {
    const lobxContext = lobxFactory({
      lobxRefInjector: LobxRefInjectorFactory({
        idGenerator: IDCountingGenerator(0)
      })
    });
    const test = new TestAction();
    expect(lobxContext.action(test.wurst).apply(test)).toBe(5);
    expect(typeof ((test as unknown) as LobxRef).__lobx).toBe('object');
    expect(((test as unknown) as LobxRef).__lobx.id).toBe('1');
    expect(typeof ((test.wurst as unknown) as LobxRef).__lobx).toBe('object');
    expect(((test.wurst as unknown) as LobxRef).__lobx.id).toBe('2');
  });
  test('action loop ', () => {
    const origActionHandler = [...LOBX.lobx.actionChain];
    try {
      LOBX.lobx.actionChain.forEach(
        (x, index) =>
          (LOBX.lobx.actionChain[index] = jest.fn(function(...args) {
            return x.apply(this, args);
          }))
      );
      const test = new TestAction();
      for (let i = 0; i <= 15; i++) {
        expect(test.brot.apply(test, [1, 'w'])).toBe(6);
        expect(test.fn.mock.calls.length).toBe(i + 1);
        LOBX.lobx.actionChain.forEach((x: jest.Mock) => {
          expect(x.mock.calls.length).toBe(i + 1);
        });
      }
    } finally {
      origActionHandler.forEach(
        (x, index) => (LOBX.lobx.actionChain[index] = x)
      );
    }
  });
  test('undefined this __lobx', () => {
    const fn = jest.fn();
    const test = action(fn);
    test.apply(undefined);
    expect((fn as any).__lobx.id.length).toBeGreaterThan(15);
  });
  test('defined this __lobx', () => {
    const test = new TestAction();
    test.brot(1, 'wer');
    expect((test.brot as any).__lobx.wrapped.__lobx.id.length).toBeGreaterThan(
      15
    );
    expect((test as any).__lobx.id.length).toBeGreaterThan(15);
  });
});
