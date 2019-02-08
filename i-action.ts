export type IAction = unknown;

export interface IActionFactory {
  <A1, R, T extends (a1: A1) => R>(fn: T): T & IAction;
  <A1, A2, R, T extends (a1: A1, a2: A2) => R>(fn: T): T & IAction;
  <A1, A2, A3, R, T extends (a1: A1, a2: A2, a3: A3) => R>(fn: T): T & IAction;
  <A1, A2, A3, A4, R, T extends (a1: A1, a2: A2, a3: A3, a4: A4) => R>(
    fn: T
  ): T & IAction;
  <
    A1,
    A2,
    A3,
    A4,
    A5,
    R,
    T extends (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => R
  >(
    fn: T
  ): T & IAction;
  <
    A1,
    A2,
    A3,
    A4,
    A5,
    A6,
    R,
    T extends (a1: A1, a2: A2, a3: A3, a4: A4, a6: A6) => R
  >(
    fn: T
  ): T & IAction;
  <A1, R, T extends (a1: A1) => R>(name: string, fn: T): T & IAction;
  <A1, A2, R, T extends (a1: A1, a2: A2) => R>(name: string, fn: T): T &
    IAction;
  <A1, A2, A3, R, T extends (a1: A1, a2: A2, a3: A3) => R>(
    name: string,
    fn: T
  ): T & IAction;
  <A1, A2, A3, A4, R, T extends (a1: A1, a2: A2, a3: A3, a4: A4) => R>(
    name: string,
    fn: T
  ): T & IAction;
  <
    A1,
    A2,
    A3,
    A4,
    A5,
    R,
    T extends (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => R
  >(
    name: string,
    fn: T
  ): T & IAction;
  <
    A1,
    A2,
    A3,
    A4,
    A5,
    A6,
    R,
    T extends (a1: A1, a2: A2, a3: A3, a4: A4, a6: A6) => R
  >(
    name: string,
    fn: T
  ): T & IAction;
  <T extends Function>(fn: T): T & IAction;
  <T extends Function>(name: string, fn: T): T & IAction;
  (customName: string): (
    target: Object,
    key: string | symbol,
    baseDescriptor?: PropertyDescriptor
  ) => void;
  (
    target: Object,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor
  ): void;
  bound(
    target: Object,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor
  ): void;
}
