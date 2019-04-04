import { v4 as uuid_v4 } from 'uuid';

export type IDGeneratorAction = () => string;

export function IDGenerator(
  generator: () => string = uuid_v4
): IDGeneratorAction {
  return () => generator();
}
