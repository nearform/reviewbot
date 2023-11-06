import { describe, test } from 'node:test'
import assert from 'node:assert'
import { findRegexRulesInLine } from '../../functions/createReview/regex/index.js'
import regexRules from '../../functions/createReview/regex/rules.js'

describe('findRegexRulesInLine', () => {
  test('AVOID_VAR', () => {
    const rules = findRegexRulesInLine('  var foobar = bar + foo', regexRules)
    assert.deepEqual(
      rules.map(r => {
        return { id: r.id }
      }),
      [
        {
          id: 'AVOID_VAR'
        }
      ]
    )
  })

  test('PROMISE_ALL_USAGE', () => {
    const rules = findRegexRulesInLine('  Promise.all(myPromises);', regexRules)
    assert.deepEqual(
      rules.map(r => {
        return { id: r.id }
      }),
      [
        {
          id: 'PROMISE_ALL_USAGE'
        }
      ]
    )
  })

  test('MD5_USAGE', () => {
    const rules = findRegexRulesInLine('    MD5(myString) ;', regexRules)
    assert.deepEqual(
      rules.map(r => {
        return { id: r.id }
      }),
      [
        {
          id: 'MD5_USAGE'
        }
      ]
    )
  })

  test('LOCALSTORAGE_USAGE', () => {
    const rules = findRegexRulesInLine(
      '    localStorage.setItem("foo", "bar")',
      regexRules
    )

    assert.deepEqual(
      rules.map(r => {
        return { id: r.id }
      }),
      [
        {
          id: 'LOCALSTORAGE_USAGE'
        }
      ]
    )
  })

  test('EVAL_USAGE', () => {
    const rules = findRegexRulesInLine('    eval("const f = 2")', regexRules)

    assert.deepEqual(
      rules.map(r => {
        return { id: r.id }
      }),
      [
        {
          id: 'EVAL_USAGE'
        }
      ]
    )
  })
})
