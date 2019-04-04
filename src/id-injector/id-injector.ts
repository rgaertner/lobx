import { IDGeneratorAction } from '../id-generator/id-generator';
import { v4 as uuid_v4 } from 'uuid';
import {
  ActionContext,
  ActiveChain,
  ChainFunction
} from '../action-chain/action-chain';

export interface IDInjectorProps {
  readonly idGenerator: IDGeneratorAction;
}

export function IDInjectorFactory(
  props: IDInjectorProps = { idGenerator: uuid_v4 }
): ChainFunction {
  return (ac: ActionContext, chain: ActiveChain): unknown => {
    if (!ac.hasOwnProperty('id')) {
      ac.id = props.idGenerator();
    }
    const ret = chain.next(ac);
    return ret;
  };
}
