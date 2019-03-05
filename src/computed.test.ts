import { computed } from './lobx';
import {
  hasSetterLobxId,
  getSetterLobxId,
  hasGetterLobxId,
  getGetterLobxId,
  hasInstanceLobxId,
  getInstanceLobxId
} from './utils/lobxHelper';
describe('computed ', () => {
  class TestAction {
    public fn = jest.fn();

    @computed
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
    const test = new TestAction();
    expect(test.wurst).toBe(5);
    expect(test.testCallToGetter).toBe(2);
    expect(hasInstanceLobxId(test)).toBe(true);
    expect(getInstanceLobxId(test).length).toBeGreaterThan(15);
    (test as any).getterName = 'wurst';
    expect(hasGetterLobxId(test)).toBe(true);
    const wurstId = getGetterLobxId(test);
    expect(wurstId.length).toBeGreaterThan(20);
    (test as any).getterName = 'testCallToGetter';
    expect(hasGetterLobxId(test)).toBe(true);
    const testCallToGetterId = getGetterLobxId(test);
    expect(testCallToGetterId.length).toBeGreaterThan(20);
    expect(wurstId != testCallToGetterId).toBe(true);
  });

  test('passing arguments to bound method', () => {
    const test = new TestAction();
    test.wurst = 4;
    (test as any).setterName = 'wurst';
    expect(hasSetterLobxId(test)).toBe(true);
    expect(getSetterLobxId(test).length).toBeGreaterThan(15);
    expect(test.fn.mock.calls[0]).toEqual([test, 'setter', 4]);
  });
});
