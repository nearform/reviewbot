export function example() {
  const obj = {'foo': 'bar'}

  // expect: J3
  JSON.parse(JSON.stringify(obj))
}