import { LobxRef } from '../action-chain/action-chain';

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
  debugger;
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
  debugger;
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
  debugger;
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
