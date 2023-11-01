import { Parser } from 'acorn'
import tsPlugin from 'acorn-typescript'
import path from 'node:path'
import { LooseParser } from 'acorn-loose'
import jsxPlugin from 'acorn-jsx'

import validators from './rules/index.js'
import { parseAndAggregate } from './parser.js'
import { findLinePositionInDiff } from '../../utils.js'

function getParser(fileName) {
  const fileExtension = path.extname(fileName)
  let parser
  if (fileExtension === '.ts' || fileExtension === '.tsx') {
    parser = Parser.extend(tsPlugin())
  } else if (fileExtension === '.jsx') {
    parser = Parser.extend(jsxPlugin())
  } else if (fileExtension === '.js') {
    parser = Parser
  }
  return parser
}

export function generateAST(fileContent, fileDiff) {
  console.log(fileDiff)
  const parser = getParser(fileDiff.afterName)
  if (!parser) return
  let ast
  try {
    ast = parser.parse(fileContent, {
      sourceType: /^import\s+/.test(fileContent) ? 'module' : 'commonjs',
      locations: true
    })
  } catch (err) {
    console.log(
      '[reviewbot] - Failed to parse the file content into AST. Falling back to the loose parser.'
    )
    ast = LooseParser.parse(fileContent, { locations: true })
  }

  ast.diff = fileDiff
  return ast
}

function aggregateComments(linesWhiteList) {
  return astNode => {
    const comments = []
    for (let validator of validators) {
      const comment = validator(astNode, linesWhiteList)
      if (comment) {
        comments.push(comment)
      }
    }
    return comments
  }
}

export function parseForIssues(astDocument, gitDiff) {
  const modifiedLines = gitDiff.modifiedLines
    .filter(lineData => lineData.added === true)
    .map(lineData => lineData.lineNumber)
  return parseAndAggregate(astDocument, aggregateComments(modifiedLines))
}

export function createASTPRComments(gitDiff, filesContents, rawDiff) {
  let allIssues = []
  for (let fileDiff of gitDiff) {
    const fileContent = filesContents.find(
      fileContent => fileContent.filename === fileDiff.afterName
    )
    if (fileContent) {
      const ast = generateAST(fileContent.content, fileDiff)
      const fileIssues = parseForIssues(ast, fileDiff)
      allIssues = allIssues.concat(fileIssues)
    }
  }

  return allIssues.map(issue => ({
    path: issue.filename,
    position: findLinePositionInDiff(
      rawDiff,
      issue.filename,
      issue.lineContent
    ),
    body: issue.description
  }))
}
