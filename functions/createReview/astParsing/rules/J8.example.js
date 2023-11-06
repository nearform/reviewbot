
export function example() {
  const foo = 'bar'
  let bar = 'foo'
  // expect: J8
  var foobar = bar + foo
  bar = foobar
}