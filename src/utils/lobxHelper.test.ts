import { computed, action } from '../lobx';
import {
  hasLobxId,
  getLobxId,
  getInstanceLobxId,
  hasWrappedLobxId,
  hasInstanceLobxId,
  getWrappedLobxId,
  hasGetterLobxId,
  getGetterLobxId,
  hasSetterLobxId,
  getSetterLobxId,
  getDecoratedLobxId
} from './lobxHelper';

class TestAction {
  public fn = jest.fn();

  @computed
  public get testCallToGetter() {
    return 2;
  }

  @computed
  public get wurst(): number {
    this.fn(this, 'getter', 5);
    return 5;
  }

  public set wurst(a1: number) {
    this.fn(this, 'setter', a1);
  }

  @action
  public call() {
    return 'called';
  }
}
test('get LobxRef from class instance', () => {
  const test = new TestAction();
  test.call();
  expect(hasLobxId(test)).toBe(true);
  expect(hasInstanceLobxId(test)).toBe(true);
  expect(getInstanceLobxId(test).length).toBeGreaterThan(20);
  expect(getLobxId(test).length).toBeGreaterThan(20);
});

test('get LobxRef from callback instance', () => {
  const test = new TestAction();
  test.call();
  expect(hasWrappedLobxId(test.call)).toBe(true);
  expect(hasLobxId(test.call)).toBe(true);
  const wrappedId = getWrappedLobxId(test.call);
  expect(wrappedId.length).toBeGreaterThan(20);
  expect(getLobxId(test.call).length).toBeGreaterThan(20);
  (test as any).methodName = 'call';
  const decoratorId = getDecoratedLobxId(test);
  expect(decoratorId === wrappedId).toBe(true);
});

test('get LobxRef from get field', () => {
  const test = new TestAction();
  expect(test.wurst).toBe(5);
  (test as any).getterName = 'wurst';
  expect(hasLobxId(test)).toBe(true);
  expect(hasGetterLobxId(test)).toBe(true);
  expect(getGetterLobxId(test).length).toBeGreaterThan(20);
  expect(getLobxId(test).length).toBeGreaterThan(20);
});

test('get LobxRef from set field', () => {
  const test = new TestAction();
  test.wurst = 6;
  (test as any).setterName = 'wurst';
  expect(hasLobxId(test)).toBe(true);
  expect(hasSetterLobxId(test)).toBe(true);
  const setterId = getSetterLobxId(test);
  expect(setterId.length).toBeGreaterThan(20);
  const instanceId = getInstanceLobxId(test);
  expect(instanceId.length).toBeGreaterThan(20);
  expect(setterId === instanceId).toBe(false);
});
