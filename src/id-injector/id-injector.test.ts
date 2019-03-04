import { IDGenerator } from '../id-generator/id-generator';
import { IDInjectorFactory } from './id-injector';
import {
  ActionContext,
  ActiveChain,
  LobxContext
} from '../action-chain/action-chain';
import { LobxRefInjectorFactory } from './lobx-ref-injector';

describe('id injector', () => {
  test('inject id', () => {
    const fn = jest.fn();
    const chain = new ActiveChain([
      LobxRefInjectorFactory({ idGenerator: IDGenerator(() => '4') })
    ]);
    const ac: ActionContext = { self: this, action: { fn } };
    const result = chain.next(ac);
    expect((fn as LobxContext).__lobx).toEqual({ id: '4' });
  });
  test('do not overwrite id with injected id', () => {
    const fn = jest.fn();
    const chain = new ActiveChain([
      LobxRefInjectorFactory({ idGenerator: IDGenerator(() => '4') })
    ]);
    (fn as LobxContext).__lobx = { id: '6' };
    const ac: ActionContext = { self: this, action: { fn }, id: '6' };
    expect((fn as LobxContext).__lobx).toEqual({ id: '6' });
  });
});
