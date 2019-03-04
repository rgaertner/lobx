export function IDCountingGenerator(start = 0) {
  return () => '' + ++start;
}
