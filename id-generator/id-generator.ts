import uuid = require('uuid');

export type IDGeneratorAction = () => string;

export function IDGenerator(
  generator: () => string = uuid.v4
): IDGeneratorAction {
  return () => generator();
}
