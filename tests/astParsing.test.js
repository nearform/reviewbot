import { describe, test } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'

import path from 'path'
import url from 'url'

import {
  parseForIssues,
  generateAST,
  isESMFile
} from '../functions/createReview/astParsing/index.js'
import { isArrayFunctionCall } from '../functions/createReview/astParsing/rules/P10_loop_await.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function parseForExpectedViolations(fileContent) {
  return fileContent
    .split('\n')
    .map((line, index) => {
      const match = /\/\/\s*expect\s*:\s*(\w+)/.exec(line)
      if (match && match[1]) {
        return {
          lineNumber: index + 2, // assumes the relevant line is +1 of current line.
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
    lineNumber: violation.lineNumber,
    code: violation.code
  }
}

function loadExampleFile(relativeFilePath) {
  const exampleFileContent = fs.readFileSync(
    path.join(__dirname, relativeFilePath),
    'utf8'
  )
  const lines = exampleFileContent.split('\n').map((l, idx) => {
    return {
      added: true,
      lineNumber: idx + 1,
      line: l
    }
  })
  const gitDiff = {
    added: true,
    deleted: false,
    beforeName: relativeFilePath,
    afterName: relativeFilePath,
    modifiedLines: lines
  }
  return {
    diff: gitDiff,
    fileContent: exampleFileContent
  }
}

describe('AST parsing - rules testing', () => {
  test('P10 - isArrayFunctionCall(node, "map")', () => {
    const arrayMapASTNode = {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ArrayExpression'
          },
          property: {
            type: 'Identifier',
            name: 'map'
          }
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'AwaitExpression'
            }
          }
        ]
      }
    }
    assert.ok(isArrayFunctionCall(arrayMapASTNode, 'map'))
  })

  test('P10 - isArrayFunctionCall(node, "map")', () => {
    const arrayMapASTNode = {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier'
          },
          property: {
            type: 'Identifier',
            name: 'forEach'
          }
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            body: {
              type: 'AwaitExpression'
            }
          }
        ]
      }
    }
    assert.ok(isArrayFunctionCall(arrayMapASTNode, 'forEach'))
  })

  test('P10 - nominal', () => {
    const { fileContent, diff } = loadExampleFile(
      '../functions/createReview/astParsing/rules/P10.example.js'
    )
    const ast = generateAST(fileContent, diff)
    fs.writeFileSync('p10.ast.json', JSON.stringify(ast, null, 2), 'utf8')
    const violations = parseForIssues(ast, diff).map(removeDescription)

    const expectedViolations = parseForExpectedViolations(fileContent)
    assert.notEqual(violations.length, 0)
    assert.deepEqual(violations, expectedViolations)
  })

  test('P10 - parse if line has been updated in the PR', () => {
    const fileContent = `async function test1() {
      for(let i = 0 ; i < 10 ; i++) {
        await myPromise()
      }
    }`
    const diff = {
      added: true,
      afterName: 'file.js',
      modifiedLines: [
        {
          added: true,
          lineNumber: 3
        }
      ]
    }
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)
    assert.deepEqual(violations, [{ lineNumber: 3, code: 'P10' }])
  })

  test('P10 - ignore if line has been deleted from the PR', () => {
    const fileContent = `async function test1() {
      for(let i = 0 ; i < 10 ; i++) {
        await myPromise()
      }
    }`
    const diff = {
      added: true,
      afterName: 'file.js',
      modifiedLines: [
        {
          added: false,
          lineNumber: 3
        }
      ]
    }
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)
    assert.deepEqual(violations, [])
  })

  test('P10 - report the loop if it has been added around an existing await call`', () => {
    const fileContent = `async function test1() {
      for(let i = 0 ; i < 10 ; i++) {
        await myPromise()
      }
    }`
    const diff = {
      added: true,
      afterName: 'file.js',
      modifiedLines: [
        {
          added: true,
          lineNumber: 1
        },
        {
          added: true,
          lineNumber: 2
        },
        {
          added: true,
          lineNumber: 4
        },
        {
          added: true,
          lineNumber: 5
        }
      ]
    }
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)
    assert.deepEqual(violations, [{ lineNumber: 2, code: 'P10' }])
  })

  test('P11 - nominal', () => {
    const { fileContent, diff } = loadExampleFile(
      '../functions/createReview/astParsing/rules/P11.example.js'
    )
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)

    const expectedViolations = parseForExpectedViolations(fileContent)
    assert.notEqual(violations.length, 0)
    assert.deepEqual(violations, expectedViolations)
  })

  test('P11 unbound promise - parse if line has been updated in the PR', () => {
    const fileContent = `const promises = []
    Promise.all(promises)
    `
    const diff = {
      added: true,
      afterName: 'file.js',
      modifiedLines: [
        {
          added: true,
          lineNumber: 2
        }
      ]
    }
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)

    assert.deepEqual(violations, [{ lineNumber: 2, code: 'P11' }])
  })

  test('P11 unbound promise - ignore if line has NOT been updated in the PR', () => {
    const fileContent = `const promises = []
    Promise.all(promises)
    `
    const diff = {
      added: true,
      afterName: 'file.js',
      modifiedLines: [
        {
          added: true,
          lineNumber: 1
        }
      ]
    }
    const ast = generateAST(fileContent, diff)
    const violations = parseForIssues(ast, diff).map(removeDescription)
    assert.deepEqual(violations, [])
  })
})

describe('AST parsing unit testing', () => {
  test('isESMFile', () => {
    assert.equal(
      isESMFile(`import foo from 'bar'
    import bar from 'foo'
    `),
      true
    )

    assert.equal(
      isESMFile(`const foobar = fs.foo()
export foobar
    `),
      true
    )

    assert.equal(
      isESMFile(`const foobar = fs.foo()
    export foobar
    `),
      true
    )

    assert.equal(
      isESMFile(`const foobar = fs.foo()
    export foobar;
    `),
      true
    )

    assert.equal(
      isESMFile(`const fs = require('fs')
    const foobar = fs.foo()
    module.exports = {foobar}
    `),
      false
    )

    assert.equal(
      isESMFile(`const bar = 'foo'
    const foobar = 'bar'+ bar
    `),
      false
    )
  })
})
