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
  getDecoratedLobxId,
  createFunctionLobxId,
  MyLobxFunctionIntrospection,
  result,
  LobxType,
  createPropertyLobxId,
  MyLobxPropertyIntrospection,
  reflectForEach
} from './lobxHelper';
import { LobxRef } from '../action-chain/action-chain';

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

test.only('reflect function from lobx instance', () => {
  const test = new TestAction();
  test.call();
  const func: result<MyLobxFunctionIntrospection> = createFunctionLobxId({
    instance: test,
    property: 'call',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test))
  });
  expect(func.ok.id.length).toBeGreaterThan(15);
  expect(func.ok.name).toBe('call');
  expect(func.ok.type).toBe(LobxType.Function);
});

test.only('reflect get property from lobx instance', () => {
  const test = new TestAction();
  test.wurst;
  const prop: result<MyLobxPropertyIntrospection> = createPropertyLobxId({
    instance: test,
    property: 'wurst',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test))
  });
  expect(prop.ok.name).toBe('wurst');
  expect(prop.ok.get.id.length).toBeGreaterThan(15);
  expect(prop.ok.type).toBe(LobxType.Property);
});

test.only('reflect set property from lobx instance', () => {
  const test = new TestAction();
  test.wurst = 3;
  const prop: result<MyLobxPropertyIntrospection> = createPropertyLobxId({
    instance: test,
    property: 'wurst',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test))
  });
  expect(prop.ok.name).toBe('wurst');
  expect(prop.ok.set.id.length).toBeGreaterThan(15);
  expect(prop.ok.get.id.length).toBeGreaterThan(15);
  expect(prop.ok.type).toBe(LobxType.Property);
});

test.only('reflect set & get property from lobx instance', () => {
  const test = new TestAction();
  const prop: result<MyLobxPropertyIntrospection> = createPropertyLobxId({
    instance: test,
    property: 'wurst',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test))
  });
  test.wurst = 3;
  expect(prop.ok.name).toBe('wurst');
  expect(prop.ok.set.id.length).toBeGreaterThan(15);
  expect(prop.ok.get.id.length).toBeGreaterThan(15);
  expect(prop.ok.type).toBe(LobxType.Property);
  expect(prop.ok.name).toBe(prop.ok.name);
  expect(prop.ok.set.id).toBe(prop.ok.set.id);
  expect(prop.ok.get.id).toBe(prop.ok.get.id);
  expect(prop.ok.type).toBe(prop.ok.type);
});

test('reflect set & get from two lobx instances', () => {
  const test = new TestAction();
  const test2 = new TestAction();
  const prop: result<MyLobxPropertyIntrospection> = createPropertyLobxId({
    instance: test,
    property: 'wurst',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test))
  });
  const prop2: result<MyLobxPropertyIntrospection> = createPropertyLobxId({
    instance: test2,
    property: 'wurst',
    object: Object.getOwnPropertyDescriptors(Object.getPrototypeOf(test2))
  });
  test2.wurst = 3;
  expect(prop2.ok.name).toBe('wurst');
  expect(prop2.ok.set.id.length).toBeGreaterThan(15);
  expect(prop2.ok.get.id.length).toBeGreaterThan(15);
  expect(prop2.ok.type).toBe(LobxType.Property);
  expect(prop2.ok.name).toBe(prop.ok.name);
  expect(prop2.ok.set.id).toBe(prop.ok.set.id);
  expect(prop2.ok.get.id).toBe(prop.ok.get.id);
  expect(prop2.ok.type).toBe(prop.ok.type);
});

test.only('reflect instance', () => {
  const test = new TestAction();
  const test2 = new TestAction();
  test.wurst;
  test2.wurst;
  const reflectedTest = reflectForEach(test);
  const reflectedTest2 = reflectForEach(test2);
  expect(reflectedTest.id === reflectedTest2.id).toBe(false);
  expect(reflectedTest.properties('wurst').set.id.length).toBeGreaterThan(15);
  expect(reflectedTest.properties('wurst').get.id.length).toBeGreaterThan(15);
  expect(reflectedTest.functions('call').id.length).toBeGreaterThan(15);
});
