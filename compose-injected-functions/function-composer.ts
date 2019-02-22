import { SelfContext } from '../self-injector/self-injector';

export declare type ComposerFunction = (...args: unknown[]) => unknown;
export declare type ContextComposerFunction = (
  ctx: {},
  ...args: unknown[]
) => ContextComposerFunction;
export declare type IdFunction = (fn: ComposerFunction) => ComposerFunction;
export declare type ComposedFunction = (
  fn: ContextComposerFunction
) => ContextComposerFunction;

export function functionComposer(
  logic: ComposerFunction,
  startContext: ComposedFunction,
  contextFunctions: ContextComposerFunction[]
): ComposerFunction {
  if (!startContext || (contextFunctions && contextFunctions.length === 0)) {
    return function(...args: unknown[]) {
      return logic.apply(this, args);
    };
  }
  const contextChain = [startContext, ...contextFunctions];
  let ctx = {};
  const contextFunc = contextChain.reduce((prev, curr) => {
    debugger;
    return (ctx: {}, ...args: unknown[]) => prev(curr(ctx, args), ctx, args);
  });
  return contextFunc(function(ctx: {}, ...args: unknown[]) {
    debugger;
    return logic.apply(ctx, args);
  });
}
