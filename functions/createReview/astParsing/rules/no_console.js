import { isLineEdited, isType } from '../parser.js'

const logCalls = ['log', 'info', 'warn', 'error', 'dir']

export default function validator(node, editedLineNumbers) {
  if (
    isLineEdited(node, editedLineNumbers) &&
    isType(node, 'CallExpression') &&
    isType(node.callee, 'MemberExpression') &&
    isType(node.callee.object, 'Identifier') &&
    node.callee.object.name === 'console' &&
    logCalls.indexOf(node.callee.property.name) > -1
  ) {
    return {
      lineNumber: node.loc.start.line,
      code: 'no_console',
      description: `Prefer using a dedicated logger rather than using \`console\` to log information and avoid abstracting the logger. I recommend using [pino](https://github.com/pinojs/pino) which is fast and makes following best practices easy.
See [this video](https://vimeo.com/180476148) for reference.`
    }
  }
}
