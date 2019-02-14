import { IDGenerator } from '../id-generator/id-generator';
import { IDInjectorFactory } from './id-injector';

describe('id injector', () => {
  test('inject id', () => {
    const fn = jest.fn();
    const idInjector = IDInjectorFactory({
      idGenerator: IDGenerator(() => '4')
    });
    idInjector(fn)({}, 1, 2);
    expect(fn.mock.calls[0][0]).toEqual({ id: '4' });
    expect(fn.mock.calls[0][1]).toEqual(1);
    expect(fn.mock.calls[0][2]).toEqual(2);
  });
  test('do not overwrite id with injected id', () => {
    const fn = jest.fn();
    const idInjector = IDInjectorFactory({
      idGenerator: IDGenerator(() => '4')
    });
    idInjector(fn)({ id: '6' }, 1, 2);
    expect(fn.mock.calls[0][0]).toEqual({ id: '6' });
    expect(fn.mock.calls[0][1]).toEqual(1);
    expect(fn.mock.calls[0][2]).toEqual(2);
  });
});
