import { findChildNode, isType } from '../parser.js'

export default function validator(node) {
  if (isType(node, 'ForStatement')) {
    const nestedAwaitExpression = findChildNode(node, childNode =>
      isType(childNode, 'AwaitExpression')
    )
    if (nestedAwaitExpression) {
      return {
        line: nestedAwaitExpression.loc.start.line,
        code: 'P10',
        description: `Review instances of awaiting promises in imperative loops (for, while, do/while) or array native methods (forEach, map).

        In many cases they are unnecessary as parallel execution is preferred.

        Prefer using Promise native methods like Promise.all, or Promise.race, or Promise.allSettled or libraries like p-map as recommended next.

        If serial execution is needed, consider using a library like sindresorhus/p-series.

        There is also an eslint rule to enforce this which we recommend using.`
      }
    }
  }
}
