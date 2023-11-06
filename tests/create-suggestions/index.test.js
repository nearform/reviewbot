import { describe, test } from 'node:test'
import assert from 'node:assert'
import fetchMock from 'fetch-mock'
import createLLMSuggestions from '../../functions/createReview/llm/index.js'

describe('createLLMSuggestions()', () => {
  test('should generate a a sugggestion for a valid git diff with one file', async t => {
    t.after(() => {
      fetchMock.restore()
    })

    fetchMock.mock({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      response: {
        body: {
          choices: [
            {
              message: {
                content: 'mockSuggestion'
              }
            }
          ]
        }
      }
    })

    const gitDiff = [
      {
        afterName: 'test.js',
        changes: [
          {
            range: {
              start: 1,
              end: 2
            },
            diff: '+ const a = 1;\n- const a = 2;\n'
          }
        ],
        modifiedLines: [
          {
            lineNumber: 1,
            line: 'const a = 1;',
            added: true
          }
        ]
      }
    ]
    const files = [
      {
        filename: 'test.js',
        status: 'added',
        content: `const a = 1;\n- const a = 2;\n
      const a = 1;`
      }
    ]
    const response = await createLLMSuggestions(gitDiff, files)
    const expectedResponse = [
      {
        diff: 'const a = 1;',
        filename: 'test.js',
        lineRange: {
          end: 1,
          start: 1
        },
        suggestions: 'mockSuggestion'
      }
    ]
    assert.deepStrictEqual(response, expectedResponse)
  })

  test('should generate a list of suggestions for a valid git diff with multiple files', async t => {
    t.after(() => {
      fetchMock.restore()
    })

    fetchMock.mock({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      response: {
        body: {
          choices: [
            {
              message: {
                content: 'mockSuggestion'
              }
            }
          ]
        }
      }
    })

    const gitDiff = [
      {
        afterName: 'test.js',
        changes: [
          {
            range: {
              start: 1,
              end: 2
            },
            diff: '+ const a = 1;\n- const a = 2;\n'
          }
        ],
        modifiedLines: [
          {
            lineNumber: 1,
            line: 'const a = 1;',
            added: true
          }
        ]
      },
      {
        afterName: 'random.ts',
        changes: [
          {
            range: {
              start: 1,
              end: 2
            },
            diff: '+ const b = 1;\n- const a = 2;\n'
          }
        ],
        modifiedLines: [
          {
            lineNumber: 1,
            line: 'const b = 1;',
            added: true
          }
        ]
      },
      {
        added: true,
        deleted: false,
        beforeName: 'regexp.example.js',
        afterName: 'regexp.example.js',
        modifiedLines: [
          {
            added: true,
            lineNumber: 7,
            line: '  var foobar = bar + foo'
          }
        ]
      }
    ]
    const response = await createLLMSuggestions(gitDiff)
    const expectedResponse = [
      {
        diff: 'const a = 1;',
        filename: 'test.js',
        lineRange: {
          end: 1,
          start: 1
        },
        suggestions: 'mockSuggestion'
      },
      {
        diff: 'const b = 1;',
        filename: 'random.ts',
        lineRange: {
          end: 1,
          start: 1
        },
        suggestions: 'mockSuggestion'
      },
      {
        filename: 'regexp.example.js',
        lineRange: {
          start: 7,
          end: 7
        },
        diff: 'var foobar = bar + foo',
        suggestions: 'mockSuggestion'
      },
      {
        fileName: 'regexp.example.js',
        lineRange: {
          start: 7,
          end: 7
        },
        diff: '  var foobar = bar + foo',
        suggestions: [
          'Using `var` for variable declarations can lead to hoisting-related issues. Consider using `let` or `const` for block-scoped variables.'
        ]
      }
    ]
    assert.deepStrictEqual(response, expectedResponse)
  })

  test('should ignore any excluded file types and common config files', async t => {
    t.after(() => {
      fetchMock.restore()
    })

    fetchMock.mock({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      response: {
        body: {
          choices: [
            {
              message: {
                content: 'mockSuggestion'
              }
            }
          ]
        }
      }
    })

    const gitDiff = [
      {
        afterName: 'package.json',
        changes: [
          {
            range: {
              start: 1,
              end: 2
            },
            diff: '+ "prepare": "npx husky install",\n- "prepare": "husky install",\n'
          }
        ],
        modifiedLines: [
          {
            lineNumber: 1,
            line: '"prepare": "npx husky install",',
            added: true
          }
        ]
      }
    ]
    const response = await createLLMSuggestions(gitDiff)
    const expectedResponse = []
    assert.deepStrictEqual(response, expectedResponse)
  })
})
