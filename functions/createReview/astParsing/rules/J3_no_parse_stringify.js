import { findChildNode, isCall } from '../parser.js'

export default function validator(node) {
  if (isCall(node, 'JSON', 'parse')) {
    const jsonStringifyChildNode = findChildNode(node, childNode =>
      isCall(childNode, 'JSON', 'stringify')
    )
    if (jsonStringifyChildNode) {
      return {
        line: node.loc.start.line,
        code: 'J3',
        description:
          'Do not use JSON.parse(JSON.stringify(obj)) to clone objects because it is slow and resource intensive. Prefer a specialised library like [rfdc](https://github.com/davidmarkclements/rfdc).'
      }
    }
  }
}
