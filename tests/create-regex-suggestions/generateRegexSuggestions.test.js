import { describe, test } from 'node:test'
import { gitDiff } from '../fixtures/index.js'
import { generateRegexSuggestions } from '../../functions/createReview/createSuggestions/regexMatching.js'

describe('generateRegexSuggestions tests', () => {
  test('Test generateRegexSuggestions', () => {
    //TODO: Implement tests
    const output = generateRegexSuggestions(gitDiff)
    console.log(output)
  })
})
