import noParseStringify from './no_parse_stringify.js'
import noVar from './no_var.js'
import noLoopAwait from './no_loop_await.js'
import noUnboundPromise from './no_unbound_promise.js'
import noConsole from './no_console.js'

export default [
  noParseStringify,
  noVar,
  noLoopAwait,
  noUnboundPromise,
  noConsole
]
