import { LobxRef, ActionFunction } from '../action-chain/action-chain';

// does that really make sense? Mixing look up for instance and mehod ids
export function hasLobxId(instance: any): boolean {
  const checkFunctions: ((i: any) => boolean)[] = [
    hasInstanceLobxId,
    hasWrappedLobxId,
    hasGetterLobxId,
    hasSetterLobxId
  ];
  const id = checkFunctions.reduce((hasId, fun) => {
    if (!hasId) {
      hasId = fun(instance);
    }
    return hasId;
  }, false);
  return id;
}

export function hasInstanceLobxId(instance: any): boolean {
  if (instance.hasOwnProperty('__lobx')) {
    return (instance as LobxRef).__lobx.hasOwnProperty('id');
  }
  return false;
}

export function hasDecoratedLobxId(instance: any): boolean {
  if (instance.hasOwnProperty('methodName')) {
    return hasGetSetLobxId(instance, instance.methodName, 'value');
  }
  return false;
}

export function getDecoratedLobxId(instance: any): string {
  if (hasDecoratedLobxId(instance)) {
    return getGetSetLobxId(instance, instance.methodName, 'value');
  }
  return '';
}
export function hasWrappedLobxId(instance: any) {
  if (instance.hasOwnProperty('__lobx')) {
    if (instance.__lobx.hasOwnProperty('wrapped')) {
      return hasInstanceLobxId(instance.__lobx.wrapped);
    }
  }
  return false;
}
export function hasGetterLobxId(instance: any): boolean {
  if (instance.hasOwnProperty('getterName')) {
    return hasGetSetLobxId(instance, instance.getterName, 'get');
  }
  return false;
}

function hasGetSetLobxId(
  instance: any,
  name: string,
  method: 'get' | 'set' | 'value'
) {
  const operation = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(instance),
    name
  )[method];
  if (operation) {
    return hasWrappedLobxId(operation);
  }
  return false;
}

function getGetSetLobxId(
  instance: any,
  name: string,
  method: 'get' | 'set' | 'value'
) {
  if (hasGetSetLobxId(instance, name, method)) {
    const operation = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(instance),
      name
    )[method];
    return getWrappedLobxId(operation);
  }
  return '';
}

export function hasSetterLobxId(instance: any): boolean {
  if (instance.hasOwnProperty('setterName')) {
    return hasGetSetLobxId(instance, instance.setterName, 'set');
  }
  return false;
}

// does that really make sense? Mixing look up for instance and mehod ids
export function getLobxId(instance: any) {
  const idFunctions: ((i: any) => string)[] = [
    getInstanceLobxId,
    getWrappedLobxId,
    getGetterLobxId,
    getSetterLobxId
  ];
  const id = idFunctions.reduce((id, fun) => {
    if (id.length === 0) {
      id = fun(instance);
    }
    return id;
  }, '');
  return id;
}

export function getInstanceLobxId(instance: any): string {
  if (hasInstanceLobxId(instance)) {
    return (instance as LobxRef).__lobx.id;
  }
  return '';
}

export function getWrappedLobxId(instance: any): string {
  if (hasWrappedLobxId(instance)) {
    return (instance.__lobx.wrapped as LobxRef).__lobx.id;
  }
  return '';
}

export function getGetterLobxId(instance: any): string {
  if (hasGetterLobxId(instance)) {
    return getGetSetLobxId(instance, instance.getterName, 'get');
  }
  return '';
}
export function getSetterLobxId(instance: any): string {
  if (hasSetterLobxId(instance)) {
    return getGetSetLobxId(instance, instance.setterName, 'set');
  }
  return '';
}

export enum LobxType {
  Instance = 'instance',
  Function = 'function',
  Property = 'property',
  None = 'none'
}

export interface LobxId {
  id: string;
  type: LobxType;
}

export interface LobxMember {
  get: ActionFunction;
  set: ActionFunction;
}
export type LobxReflect = LobxId & LobxProperty;

export interface LobxProperty {
  property?: (prop: string) => LobxId & LobxMember;
}

export interface myObject {
  [key: string]: {
    value?: LobxRef;
    set?: TypedPropertyDescriptor<any> & LobxRef;
    get?: TypedPropertyDescriptor<any> & LobxRef;
  };
}

export interface result<T> {
  ok?: T;
  error?: string;
}

export interface MyLobxPropertyIntrospection {
  name: string;
  type: LobxType;
  get?: MyLobxFunctionIntrospection;
  set?: MyLobxFunctionIntrospection;
}

export interface MyLobxFunctionIntrospection {
  name: string;
  id: string;
  fn: ActionFunction;
  type: LobxType;
}

export interface MyLobxPropertyIntrospectionMap {
  [id: string]: MyLobxPropertyIntrospection;
}

export interface MyLobxFunctionIntrospectionMap {
  [id: string]: MyLobxFunctionIntrospection;
}
export function createFunctionLobxId(props: {
  instance: any;
  object: any;
  property: string;
}): result<MyLobxFunctionIntrospection> {
  const { instance, object, property } = props;
  if (
    typeof instance[property] === 'function' &&
    instance[property].__lobx &&
    typeof object[property].value === 'function' &&
    object[property].value.__lobx
  ) {
    return {
      ok: {
        name: property,
        id: getWrappedLobxId(object[property].value),
        fn: object[property].value,
        type: LobxType.Function
      }
    };
  }
  return { error: `no function found for ${property}` };
}

export function createPropertyLobxId(props: {
  instance: any;
  object: any;
  property: string;
}): result<MyLobxPropertyIntrospection> {
  const { instance, object, property } = props;
  if (
    (typeof object[property].set === 'function' &&
      object[property].set.hasOwnProperty('__lobx')) ||
    (typeof object[property].get === 'function' &&
      object[property].get.hasOwnProperty('__lobx'))
  ) {
    const result: MyLobxPropertyIntrospection = {
      name: property,
      type: LobxType.Property
    };
    if (
      typeof object[property].set === 'function' &&
      object[property].set.hasOwnProperty('__lobx')
    ) {
      Object.assign(result, {
        set: {
          id: getWrappedLobxId(object[property].set),
          fn: object[property].set
        }
      });
    }
    if (
      typeof object[property].get === 'function' &&
      object[property].get.hasOwnProperty('__lobx')
    ) {
      Object.assign(result, {
        get: {
          id: getWrappedLobxId(object[property].get),
          fn: object[property].get
        }
      });
    }
    return { ok: result };
  }
  return { error: `Cannot find property ${property}` };
}

export function reflect(instance: any) {
  const object = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(instance)
  );
  const instanceId = getInstanceLobxId(instance);
  const functions: MyLobxFunctionIntrospectionMap = {};
  const properties: MyLobxPropertyIntrospectionMap = {};
  const result = {
    id: '',
    property: {},
    type: LobxType.None
  };
  if (instanceId) {
    Object.assign(result, {
      id: instanceId,
      type:
        instanceId == typeof 'function' ? LobxType.Function : LobxType.Instance
    });
  }

  for (let property in object) {
    const func = createFunctionLobxId({ instance, object, property });
    if (func.ok) {
      functions[func.ok.name] = func.ok;
    }
    const prop = createPropertyLobxId({ instance, object, property });
    if (prop.ok) {
      properties[prop.ok.name] = prop.ok;
    }
  }

  const functionsMapper = function(functions: MyLobxFunctionIntrospectionMap) {
    return (name: string) => functions[name];
  };

  const propertiesMapper = function(
    properties: MyLobxPropertyIntrospectionMap
  ) {
    return (name: string) => properties[name];
  };
  return {
    ...result,
    functions: functionsMapper(functions),
    properties: propertiesMapper(properties)
  };
}
