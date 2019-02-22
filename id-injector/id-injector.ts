import { IDGeneratorAction } from '../id-generator/id-generator';
import uuid = require('uuid');
import { ContextComposerFunction } from '../compose-injected-functions/function-composer';

export declare type IDContext<T = unknown> = T & { readonly id: string };
export declare type IDContextCandidate<T = unknown> = T & { id?: string };

export declare type IDInjected<T> = (
  ctx: IDContext<T>,
  ...args: unknown[]
) => ContextComposerFunction;
export declare type IDInjector<T> = (
  ctx: IDContextCandidate<T>,
  ...args: unknown[]
) => ContextComposerFunction;

export interface IDInjectorProps {
  readonly idGenerator: IDGeneratorAction;
}

export function IDInjectorFactory<T = unknown>(
  props: IDInjectorProps = { idGenerator: uuid.v4 }
) {
  debugger;
  return (cb: IDInjected<T>): IDInjector<T> => {
    return (ctx: IDContextCandidate<T>, ...args: unknown[]) => {
      debugger;
      if (!ctx.hasOwnProperty('id')) {
        ctx.id = props.idGenerator();
      }
      debugger;
      return cb(ctx as IDContext<T>, ...args);
    };
  };
}
