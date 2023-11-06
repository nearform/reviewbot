import { describe, test } from 'node:test'
import assert from 'assert'
import { createRegexSuggestions } from '../../functions/createReview/regex/index.js'

describe('createRegexSuggestions tests', () => {
  test('Avoid JSON.parse()', () => {
    const gitDiff = [
      {
        added: true,
        deleted: false,
        beforeName: 'functions/createReview/astParsing/rules/J3.example.js',
        afterName: 'functions/createReview/astParsing/rules/J3.example.js',
        modifiedLines: [
          {
            added: true,
            lineNumber: 2,
            line: 'export function example() {'
          },
          {
            added: true,
            lineNumber: 3,
            line: "  const obj = {'foo': 'bar'}"
          },
          {
            added: true,
            lineNumber: 4,
            line: ''
          },
          {
            added: true,
            lineNumber: 5,
            line: '  // expect: J3'
          },
          {
            added: true,
            lineNumber: 6,
            line: '  JSON.parse(JSON.stringify(obj))'
          },
          {
            added: true,
            lineNumber: 7,
            line: '}'
          }
        ]
      }
    ]

    const output = createRegexSuggestions(gitDiff)

    assert.deepEqual(output, [
      {
        path: 'functions/createReview/astParsing/rules/J3.example.js',
        lineNumber: 6,
        body: [
          'JSON.parse should be avoided in favor of a more secure alternative like fastify/secure-json-parse.'
        ]
      }
    ])
  })
})
