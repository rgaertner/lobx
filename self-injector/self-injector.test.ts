import { SelfInjectorFactory } from './self-injector';
describe('self injector', () => {
  test('inject self', () => {
    const fn = jest.fn();
    const selfInjector = SelfInjectorFactory();
    selfInjector(fn).apply('test', [1, 2]);
    expect(fn.mock.calls[0][0]).toEqual({ self: 'test' });
    expect(fn.mock.calls[0][1]).toEqual(1);
    expect(fn.mock.calls[0][2]).toEqual(2);
  });
});
