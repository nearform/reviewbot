export default function validator(node) {
  if (
    typeof node === 'object' &&
    node !== null &&
    node.type == 'VariableDeclaration' &&
    node.kind == 'var'
  ) {
    return {
      lineNumber: node.loc.start.line,
      code: 'no_var',
      description:
        'Use `let` or `const` instead of `var`for variable declarations because the scope for `let` and `const` is smaller. [Learn more about the difference](https://stackoverflow.com/questions/762011/what-is-the-difference-between-let-and-var).'
    }
  }
}
