export function example() {
  const obj = {'foo': 'bar'}

  // expect: no_parse_stringify
  JSON.parse(JSON.stringify(obj))
}