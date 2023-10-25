export default function validator(node) {
  if (
    typeof node === 'object' &&
    node !== null &&
    node.type == 'VariableDeclaration' &&
    node.kind == 'var'
  ) {
    return {
      line: node.loc.start.line,
      code: 'J8',
      description:
        'Use let or const instead of var because the scope for let and const is smaller. [Learn more about the difference](https://stackoverflow.com/questions/762011/what-is-the-difference-between-let-and-var).'
    }
  }
}
