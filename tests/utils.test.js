import { describe, it } from 'node:test'
import assert from 'node:assert'
import { findLinePositionInDiff } from '../functions/utils.js'

const testDiff = `diff --git a/example.js b/example.js
index 1234567..abcdefg 100644
--- a/example.js
+++ b/example.js
@@ -2,2 +2,2 @@
 const foo = () => {
-  console.log('Hello, world!');
+  console.log('Goodbye, world!');
 };
`

describe('findLinePositionInDiff', () => {
  it('should return the correct position for a line in a diff', () => {
    const filename = 'example.js'
    const lineNumber = 3
    const expectedPosition = 3
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 for a line that does not exist in the diff', () => {
    const filename = 'example.js'
    const lineNumber = 5
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 for a file that does not exist in the diff', () => {
    const filename = 'nonexistent.js'
    const lineNumber = 1
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the diff argument is empty', () => {
    const diff = ''
    const filename = 'example.js'
    const lineNumber = 1
    const expectedPosition = -1
    const position = findLinePositionInDiff(diff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the diff argument is null', () => {
    const diff = null
    const filename = 'example.js'
    const lineNumber = 1
    const expectedPosition = -1
    const position = findLinePositionInDiff(diff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the filename argument is empty', () => {
    const filename = ''
    const lineNumber = 1
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the filename argument is null', () => {
    const filename = null
    const lineNumber = 1
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the lineNumber argument is zero', () => {
    const filename = 'example.js'
    const lineNumber = 0
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })

  it('should return -1 when the lineNumber argument is negative', () => {
    const filename = 'example.js'
    const lineNumber = -1
    const expectedPosition = -1
    const position = findLinePositionInDiff(testDiff, filename, lineNumber)
    assert.deepStrictEqual(position, expectedPosition)
  })
})
