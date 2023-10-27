import { Parser } from 'acorn'
import tsPlugin from 'acorn-typescript'
import path from 'node:path'
import { LooseParser } from 'acorn-loose'
import jsxPlugin from 'acorn-jsx'

import validators from './rules/index.js'
import { parseAndAggregate } from './parser.js'

function getParser(fileName) {
  const fileExtension = path.extname(fileName)
  let parser;
  if(fileExtension === '.ts' || fileExtension === '.tsx') {
    parser = Parser.extend(tsPlugin())
  } else if(fileExtension === '.jsx') {
    parser = Parser.extend(jsxPlugin())
  } else if(fileExtension === '.js') {
    parser = Parser
  }
  return parser
}

export function generateAST(fileDiff, fileContent) {
  const parser = getParser(fileDiff.afterName)
  if(!parser) return
  let ast;
  try {
    ast = parser.parse(fileContent, {
      sourceType: /^import\s+/.test(fileContent) ? 'module' : 'commonjs',
      locations: true
    })
  } catch(err) {
    console.log('[reviewbot] - Failed to parse the file content into AST. Falling back to the loose parser.')
    ast = LooseParser.parse(fileContent, {locations: true})
  }

  ast.diff = fileDiff
  return ast
}

function aggregateComments(astNode) {
  const comments = []
  for (let validator of validators) {
    const comment = validator(astNode)
    if (comment) {
      comments.push(comment)
    }
  }
  return comments
}

export function parseForIssues(astDocument, gitDiff) {
  // TODO: only report issues on added lines
  return parseAndAggregate(astDocument, gitDiff, aggregateComments)
}
