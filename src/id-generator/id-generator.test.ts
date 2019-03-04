import { IDGenerator } from './id-generator';
import { IDCountingGenerator } from './id-counting-generator';

describe('generate id', () => {
  test('create default generator', () => {
    const generated = IDGenerator();
    expect(generated).toBeTruthy();
    expect(typeof generated).toBe('function');
    expect(generated()).toBeTruthy();
  });
  test('create counting generator', () => {
    const generated = IDGenerator(IDCountingGenerator(4711));
    expect(generated()).toBe('4712');
    expect(generated()).toBe('4713');
  });
  test('create default generator', () => {
    const fn = jest.fn(() => '4711');
    const generated = IDGenerator(fn);
    expect(generated()).toBe('4711');
    expect(generated()).toBe('4711');
  });
});
