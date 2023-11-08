import { Parser } from 'acorn'
import tsPlugin from 'acorn-typescript'
import path from 'node:path'
import { LooseParser } from 'acorn-loose'
import jsxPlugin from 'acorn-jsx'

import validators from './rules/index.js'
import { parseAndAggregate } from './parser.js'
import { mapLineToDiff } from 'map-line-to-diff'
import pino from 'pino'
import { filterAcceptedFiles, filterOnlyModified } from '../utils.js'

const logger = pino({ name: 'reviewbot' })

function getParser(fileName) {
  const fileExtension = path.extname(fileName)
  switch (fileExtension) {
    case '.ts':
    case '.tsx':
      return Parser.extend(tsPlugin())
    case '.jsx':
      return Parser.extend(jsxPlugin())
    case '.js':
      return Parser
  }
  return null
}

export function isESMFile(fileContent) {
  return (
    /^\s*import\s+/gm.test(fileContent) || /^\s*export\s+/gm.test(fileContent)
  )
}

export function generateAST(fileContent, fileDiff) {
  const parser = getParser(fileDiff.afterName)
  if (!parser) return
  let ast
  try {
    ast = parser.parse(fileContent, {
      sourceType: isESMFile(fileContent) ? 'module' : 'commonjs',
      locations: true
    })
  } catch (err) {
    logger.info(
      `Failed to parse the file content for [${fileDiff.afterName}] into AST. Falling back to the loose parser. Error: ${err.message}`
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
  if (!filesContents) {
    logger.info(
      'Skipping AST comment generation because raw files contents are missing'
    )
    return []
  }
  const acceptedFiles = filterAcceptedFiles(gitDiff)
  const filesWithModifiedLines = filterOnlyModified(acceptedFiles)

  let comments = []
  logger.info(
    `Evaluating ${filesWithModifiedLines.length} files for AST rules violations`
  )
  for (let fileDiff of filesWithModifiedLines) {
    const fileContent = filesContents.find(
      fileContent => fileContent.filename === fileDiff.afterName
    )
    if (fileContent) {
      const ast = generateAST(fileContent.content, fileDiff)
      const fileIssues = parseForIssues(ast, fileDiff)
      logger.info(
        `Found ${fileIssues.length} violations in file ${fileContent.filename}`
      )
      for (let issue of fileIssues) {
        comments.push({
          path: fileContent.filename,
          position: mapLineToDiff(
            rawDiff,
            fileContent.filename,
            issue.lineNumber
          ),
          body: issue.description
        })
      }
    }
  }

  return comments
}
