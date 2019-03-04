import { action } from './lobx';

describe('action ', () => {
  class TestAction {
    public fn = jest.fn();

    public wurst(): number {
      this.fn(this);
      return 5;
    }

    public brot(a1: number, a2: string) {
      this.fn(this, a1, a2);
    }
  }

  test('check preservation of bound (this)', () => {
    const test = new TestAction();
    const result = action(test.wurst).apply(test);
    expect(result).toBe(5);
    expect(test.fn.mock.calls[0][0]).toBe(test);
  });
});
