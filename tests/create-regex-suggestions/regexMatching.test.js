import { describe, test } from 'node:test'
import assert from 'node:assert'
import { fixtures, testRegex } from '../fixtures/index.js'
import { readFileSync } from 'fs'
import { findRegexRules } from '../../functions/createReview/createSuggestions/regexMatching.js'

describe('findRegexRules tests', () => {
  test('Test find regex with id and description', () => {
    const output = findRegexRules(
      readFileSync(fixtures[0].filePath, 'utf8'),
      testRegex
    )

    const rule = output.find(rule => rule.id === 'AVOID_VAR')
    assert.ok(rule, 'AVOID_VAR rule should be recognized')
    assert.strictEqual(rule.id, 'AVOID_VAR', 'Rule id should be AVOID_VAR')
    assert.strictEqual(
      rule.lineNumber,
      27,
      'AVOID_VAR should be found at line 27'
    )

    const promiseRule = output.find(rule => rule.id === 'PROMISE_ALL_USAGE')
    assert.ok(promiseRule, 'PROMISE_ALL_USAGE rule should be recognized')
    assert.strictEqual(
      promiseRule.id,
      'PROMISE_ALL_USAGE',
      'Rule id should be PROMISE_ALL_USAGE'
    )
    assert.strictEqual(
      promiseRule.lineNumber,
      59,
      'PROMISE_ALL_USAGE should be found at line 59'
    )
  })

  test('Array is empty if diff is empty', () => {
    const output = findRegexRules('', testRegex)
    assert.strictEqual(output.length, 0, 'Output should be an empty array')
  })

  test('Array is empty if rules array is empty', () => {
    const output = findRegexRules(
      readFileSync(fixtures[0].filePath, 'utf8'),
      []
    )
    assert.strictEqual(output.length, 0, 'Output should be an empty array')
  })

  test('Array is empty if no rules are matching', () => {
    const output = findRegexRules(readFileSync(fixtures[0].filePath, 'utf8'), [
      {
        id: 'TEST_FAKE_REGES',
        regex: /\basdasdasd\b/i,
        prompt: 'You should not recognize this regex'
      }
    ])
    assert.strictEqual(output.length, 0, 'Output should be an empty array')
  })
})
