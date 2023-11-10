
export function example() {
  const foo = 'bar'
  let bar = 'foo'
  // expect: no_var
  var foobar = bar + foo
  bar = foobar
}