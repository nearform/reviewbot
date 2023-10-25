import { Parser } from 'acorn'
// import tsPlugin from 'acorn-typescript'
// import { LooseParser } from 'acorn-loose'
// import jsxPlugin from 'acorn-jsx'

import validators from './rules/index.js'
import { parseAndAggregate } from './parser.js'

const parser = Parser
  .extend
  // jsxPlugin()
  ()

export function generateAST(fileContent) {
  return parser.parse(fileContent, {
    sourceType: 'module',
    locations: true
  })
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

export function parseForIssues(astDocument) {
  return parseAndAggregate(astDocument, aggregateComments)
}
