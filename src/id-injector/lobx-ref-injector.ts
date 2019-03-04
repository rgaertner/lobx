import { IDGeneratorAction, IDGenerator } from '../id-generator/id-generator';
import uuid = require('uuid');
import {
  ActionContext,
  ActiveChain,
  ChainFunction
} from '../action-chain/action-chain';

export interface IDInjectorProps {
  readonly idGenerator: IDGeneratorAction;
}

export function LobxRefInjectorFactory(
  props: IDInjectorProps = { idGenerator: uuid.v4 }
): ChainFunction {
  return (ac: ActionContext, chain: ActiveChain): unknown => {
    if (ac.self && !ac.self.hasOwnProperty('__lobx')) {
      ac.self.__lobx = { id: props.idGenerator() };
    }
    if (ac.action && ac.action.fn && !ac.action.fn.hasOwnProperty('__lobx')) {
      ac.action.fn.__lobx = { id: props.idGenerator() };
    }
    return chain.next(ac);
  };
}
