import { isCall } from '../parser.js'

export default function validator(node) {
  if (isCall(node, 'Promise', 'all')) {
    return {
      line: node.loc.start.line,
      code: 'P11',
      description:
        'Executing Promise.all(items.map(async => { … })) leads to the creation of an undefined number of Promises, each executing something asynchronous and possibly saturating the event loop and consuming much memory. Recommend using a library like sindresorhus/p-map or sindresorhus/p-all instead.'
    }
  }
}
