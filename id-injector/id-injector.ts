import { IDGeneratorAction } from '../id-generator/id-generator';
import uuid = require('uuid');

export declare type IDContext<T = unknown> = T & { readonly id: string };
export declare type IDContextCandidate<T = unknown> = T & { id?: string };

export declare type IDInjected<T> = (
  ctx: IDContext<T>,
  ...args: unknown[]
) => unknown;
export declare type IDInjector<T> = (
  ctx: IDContextCandidate<T>,
  ...args: unknown[]
) => unknown;

export interface IDInjectorProps {
  readonly idGenerator: IDGeneratorAction;
}

export function IDInjectorFactory<T = unknown>(
  props: IDInjectorProps = { idGenerator: uuid.v4 }
) {
  return (cb: IDInjected<T>): IDInjector<T> => {
    return (ctx: IDContextCandidate<T>, ...args: unknown[]) => {
      if (!ctx.hasOwnProperty('id')) {
        ctx.id = props.idGenerator();
      }
      return cb(ctx as IDContext<T>, ...args);
    };
  };
}
