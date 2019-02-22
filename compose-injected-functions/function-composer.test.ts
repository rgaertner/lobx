import { functionComposer, ContextComposerFunction } from './function-composer';
import { SelfInjectorFactory } from '../self-injector/self-injector';
import { IDInjectorFactory } from '../id-injector/id-injector';

describe('compose function', () => {
  test('compose without context functions', () => {
    const functions: ContextComposerFunction[] = [];
    const logic = jest.fn(function() {
      return this;
    });
    const composed = functionComposer(logic, undefined, functions);
    const result = composed.apply('teste', [1, 2]);
    expect(result).toEqual('teste');
    expect(logic.mock.calls[0]).toEqual([1, 2]);
  });
  test('test correct evaluation order of contextFunctions', () => {
    const fn1 = jest.fn(function(ctx, args) {
      return this;
    });
    const fn2 = jest.fn(function(ctx, args) {
      return this;
    });
    const firstCallMarker = { first: 'called' };
    const secondCallMarker = { second: 'called' };
    const firstInjector = (cb: ContextComposerFunction) => (
      ctx: {},
      ...args: unknown[]
    ) => {
      fn1({ first: 'called', ...ctx }, args);
      return cb(ctx, args);
    };
    const secondInjector = (cb: ContextComposerFunction) => (
      ctx: {},
      ...args: unknown[]
    ) => {
      fn1({ second: 'called', ...ctx }, args);
      return cb(ctx, args);
    };
    const functions: ContextComposerFunction[] = [secondInjector];
    const logic = jest.fn(function() {
      return this;
    });
    const composed = functionComposer(logic, firstInjector, functions);
    const result = composed.apply('teste', [1, 2, 3]);
    expect(fn1.mock.calls[0][0]).toEqual(firstCallMarker);
    expect(fn1.mock.calls[1][0]).toEqual(secondCallMarker);
  });
  test('compose with context multiple functions', () => {
    const selfinjected = SelfInjectorFactory();
    const idInjector = IDInjectorFactory();
    const fn = jest.fn();
    const functions: ContextComposerFunction[] = [idInjector];
    const logic = jest.fn(function() {
      return this;
    });
    const composed = functionComposer(logic, selfinjected, functions);
    const result = composed.apply('teste', [1, 2, 3]);
    expect(result.self).toEqual('teste');
    expect(logic.mock.calls[0]).toEqual([1, 2, 3]);
  });
  test('compose with context multiple functions', () => {
    const selfinjected = SelfInjectorFactory();
    const idInjector = IDInjectorFactory();
    const fn = jest.fn(function(ctx, args) {
      return this;
    });
    const testInjector = (cb: ContextComposerFunction) => (
      ctx: {},
      ...args: unknown[]
    ) => {
      fn(ctx, args);
      return cb(ctx, ...args);
    };
    const functions: ContextComposerFunction[] = [idInjector, testInjector];
    const logic = jest.fn(function() {
      return this;
    });
    const composed = functionComposer(logic, selfinjected, functions);
    const result = composed.apply('teste', [1, 2, 3]);
    expect(result.self).toEqual('teste');
    expect(logic.mock.calls[0]).toEqual([1, 2, 3]);
  });
});
