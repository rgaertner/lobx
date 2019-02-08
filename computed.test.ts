import { computed } from './lobx';
describe('computed ', () => {
  class TestAction {
    public fn = jest.fn();

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

  test('passing arguments to bound method', () => {
    const test = new TestAction();
    test.wurst = 4;
    expect(test.fn.mock.calls[0]).toEqual([test, 'setter', 4]);
  });
});
