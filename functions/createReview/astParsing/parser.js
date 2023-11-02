// The properties in the AST tree that the parsing algorithm should walk through to recurse through the whole tree
export const AST_PARSING_PROPS = [
  'body',
  'declarations',
  'init',
  'expression',
  'argument',
  'arguments',
  'children'
]

export function parseAndAggregate(astDocument, aggrFunc) {
  let aggregatedData = aggrFunc(astDocument)

  if (typeof astDocument === 'object' && astDocument !== null) {
    for (let prop of AST_PARSING_PROPS) {
      if (prop in astDocument && Array.isArray(astDocument[prop])) {
        for (let el of astDocument[prop]) {
          const newAggrData = parseAndAggregate(el, aggrFunc)
          aggregatedData = aggregatedData.concat(newAggrData)
        }
      } else if (prop in astDocument) {
        const newAggrData = parseAndAggregate(astDocument[prop], aggrFunc)
        aggregatedData = aggregatedData.concat(newAggrData)
      }
    }
  }
  return aggregatedData
}

export function findChildNode(astDocument, boolFunction) {
  if (typeof astDocument === 'object' && astDocument !== null) {
    for (let prop of AST_PARSING_PROPS) {
      if (prop in astDocument && Array.isArray(astDocument[prop])) {
        for (let el of astDocument[prop]) {
          if (boolFunction(el)) {
            return el
          }
          const matchingChildNode = findChildNode(el, boolFunction)
          if (matchingChildNode) {
            return matchingChildNode
          }
        }
      } else if (prop in astDocument) {
        if (boolFunction(astDocument[prop])) {
          return astDocument[prop]
        }
        const matchingChildNode = findChildNode(astDocument[prop], boolFunction)
        if (matchingChildNode) {
          return matchingChildNode
        }
      }
    }
  }
}

export function isCall(node, objectName, propertyName) {
  if (
    typeof node === 'object' &&
    node !== null &&
    node.type == 'CallExpression' &&
    node.callee &&
    node.callee.object &&
    node.callee.property
  ) {
    const obj = node.callee.object
    const prop = node.callee.property
    if (
      obj.type == 'Identifier' &&
      obj.name == objectName &&
      prop.type == 'Identifier' &&
      prop.name == propertyName
    ) {
      return true
    }
  }
}

export function isType(node, type) {
  if (typeof node === 'object' && node !== null && node.type == type) {
    return true
  }
}

export function isLineEdited(node, editedLineNumbers) {
  return editedLineNumbers.indexOf(node.loc.start.line) > -1
}
