import { describe, test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'fs'

import path from 'path'
import url from 'url'

import {
  parseForIssues,
  generateAST
} from '../functions/createReview/astParsing/index.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function parseForExpectedViolations(fileContent) {
  return fileContent
    .split('\n')
    .map((line, index) => {
      const match = /\/\/\s*expect\s*:\s*(\w+)/.exec(line)
      if (match && match[1]) {
        return {
          line: index + 2, // assumes the relevant line is +1 of current line.
          code: match[1]
        }
      } else {
        return null
      }
    })
    .filter(match => match !== null)
}

function removeDescription(violation) {
  return {
    line: violation.line,
    code: violation.code
  }
}

describe('AST parsing unit testing', () => {
  test('P10', () => {
    const jsFile = readFileSync(
      path.join(
        __dirname,
        '../functions/createReview/astParsing/rules/P10.example.js'
      ),
      'utf8'
    )
    const ast = generateAST(jsFile)
    const violations = parseForIssues(ast).map(removeDescription)

    const expectedViolations = parseForExpectedViolations(jsFile)
    assert.notEqual(violations.length, 0)
    assert.deepEqual(violations, expectedViolations)
  })

  test('P11', () => {
    const jsFile = readFileSync(
      path.join(
        __dirname,
        '../functions/createReview/astParsing/rules/P11.example.js'
      ),
      'utf8'
    )
    const ast = generateAST(jsFile)
    const violations = parseForIssues(ast).map(removeDescription)

    const expectedViolations = parseForExpectedViolations(jsFile)
    assert.notEqual(violations.length, 0)
    assert.deepEqual(violations, expectedViolations)
  })
})
