import { action, computed, LOBX } from './lobx';
import { LobxRef } from './action-chain/action-chain';
import {
  getSetterLobxId,
  getWrappedLobxId,
  getDecoratedLobxId
} from './utils/lobxHelper';

export class Next {
  @action
  public callme(i: string) {
    if (this.previous) {
      this.previous = 'sechs';
    }
    return i;
  }

  @computed
  public get previous() {
    return 'vier';
  }

  public set previous(i: string) {}
}

test('', () => {
  const next = new Next();
  next.callme('eins');
  const nextId = (next as LobxRef).__lobx.id;
  // const lobxInstance = LOBX.lobx.instanceRegistry.get(nextId);
  // expect(lobxInstance).toBeTruthy();
  (next as any).methodName = 'callme';
  expect(getDecoratedLobxId(next).length).toBeGreaterThan(15);
  // expect(lobxInstance.actions.get())
});
