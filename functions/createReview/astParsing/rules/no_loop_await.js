import { findChildNode, isType, isLineEdited } from '../parser.js'

const loopStatements = [
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'WhileStatement',
  'DoWhileStatement'
]

function isCalleeOfType(node, expectedType) {
  return (
    !!node &&
    !!node.expression &&
    !!node.expression.callee &&
    node.expression.callee.type === 'MemberExpression' &&
    node.expression.callee.object.type === expectedType
  )
}

function isCalleeFunction(node, callFunctionName) {
  return (
    !!node &&
    !!node.expression &&
    !!node.expression.callee &&
    node.expression.callee.property &&
    node.expression.callee.property.type === 'Identifier' &&
    node.expression.callee.property.name === callFunctionName
  )
}

export function isArrayFunctionCall(node, functionName) {
  return (
    !!node &&
    !!node.type &&
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    (isCalleeOfType(node, 'ArrayExpression') ||
      isCalleeOfType(node, 'Identifier')) && // TODO: rely on preparsed types for identifiers
    isCalleeFunction(node, functionName)
  )
}

export default function validator(node, editedLineNumbers) {
  if (
    loopStatements.find(loopType => isType(node, loopType)) ||
    isArrayFunctionCall(node, 'map') ||
    isArrayFunctionCall(node, 'forEach')
  ) {
    const nestedAwaitExpression = findChildNode(node, childNode =>
      isType(childNode, 'AwaitExpression')
    )
    if (
      nestedAwaitExpression &&
      (isLineEdited(node, editedLineNumbers) ||
        isLineEdited(nestedAwaitExpression, editedLineNumbers))
    ) {
      return {
        lineNumber: isLineEdited(nestedAwaitExpression, editedLineNumbers)
          ? nestedAwaitExpression.loc.start.line
          : node.loc.start.line,
        code: 'no_loop_await',
        description: `Avoid nesting \`await\` inside loops. Awaiting promises in imperative loops (for, while, do/while) or array native methods (forEach, map) are often unnecessary as parallel execution is preferred.
Prefer using Promise native methods like Promise.all, or Promise.race, or Promise.allSettled or libraries like p-map as recommended next.
If serial execution is needed, consider using a library like sindresorhus/p-series.
There is also an eslint rule to enforce this which we recommend using.`
      }
    }
  }
}
