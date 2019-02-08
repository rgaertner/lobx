export interface IComputedValue<T> {
  get(): T;
  set(value: T): void;
  // observe(listener: (change: IValueDidChange<T>) => void, fireImmediately?: boolean): Lambda;
}
export interface IComputedValueOptions<T> {
  get?: () => T;
  set?: (value: T) => void;
  name?: string;
  // equals?: IEqualsComparer<T>;
  context?: any;
  requiresReaction?: boolean;
  keepAlive?: boolean;
}

export interface IComputed {
  <T>(options: IComputedValueOptions<T>): any;
  <T>(func: () => T, setter: (v: T) => void): IComputedValue<T>;
  <T>(func: () => T, options?: IComputedValueOptions<T>): IComputedValue<T>;
  (
    target: Object,
    key: string | symbol,
    baseDescriptor?: PropertyDescriptor
  ): void;
  struct(
    target: Object,
    key: string | symbol,
    baseDescriptor?: PropertyDescriptor
  ): void;
}
