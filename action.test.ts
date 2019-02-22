import { action, lobxFactory } from './lobx';
import { IActionFactory } from './i-action';

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

  class TestAction {
    public fn = jest.fn();

    @action
    public wurst(): void {
      this.fn(this);
    }

    @action
    public brot(a1: number, a2: string) {
      this.fn(this, a1, a2);
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
    expect(test.fn.mock.calls[0]).toEqual([test, 1, 'eins']);
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
});
