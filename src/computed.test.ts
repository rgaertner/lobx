import { lobxFactory, computed } from './lobx';
import { ActionContext, LobxRef } from './action-chain/action-chain';
describe('computed ', () => {
  class TestAction {
    public fn = jest.fn();

    public get testCallToGetter() {
      return 2;
    }

    @computed
    public get wurst(): number {
      this.fn(this, 'getter', 5);
      return 5;
    }

    public set wurst(a1: number) {
      this.fn(this, 'setter', a1);
    }
  }

  test('check preservation of bound (this)', () => {
    const test = new TestAction();
    expect(test.wurst).toBe(5);
    expect(test.fn.mock.calls[0]).toEqual([test, 'getter', 5]);
  });

  test('count invocation references', () => {
    const lobxContext = lobxFactory();
    const test = new TestAction();
    // expect(lobxContext.computed(test.wurst).toBe(5);
    // expect(test.testCallToGetter()).toBe(2);
    expect(typeof ((test.testCallToGetter as unknown) as LobxRef)).toBe(
      'object'
    );
    expect(typeof ((test as unknown) as ActionContext).self.__lobx).toBe(
      'object'
    );
    expect(
      ((test.testCallToGetter as unknown) as ActionContext).self.__lobx.id
    ).toBe(1);
    expect(lobxContext).toEqual({ id: 'compute' });
  });

  test('passing arguments to bound method', () => {
    const test = new TestAction();
    test.wurst = 4;
    expect(test.fn.mock.calls[0]).toEqual([test, 'setter', 4]);
  });
});
