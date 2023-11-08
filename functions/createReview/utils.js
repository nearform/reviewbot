import path from 'node:path'
import pino from 'pino'

const logger = pino({ name: 'reviewbot' })

export const REVIEW_TYPE = {
  LLM: 'llm',
  RuleBased: 'rule_based'
}

export function filterOutInvalidComments(comments) {
  const validComments = []
  const invalidComments = []

  for (let comment of comments) {
    if (comment.position > -1) {
      validComments.push(comment)
    } else {
      invalidComments.push(comment)
      logger.error(
        `ERROR. Removing generated comment because its position in the diff could not be determined. file=${comment.path}, diff position=${comment.position}]`
      )
    }
  }
  return validComments
}

export function filterOnlyModified(files) {
  return files
    .map(file => ({
      ...file,
      modifiedLines: file.modifiedLines.filter(line => line.added)
    }))
    .filter(file => file.modifiedLines.length > 0)
}

export function filterAcceptedFiles(files) {
  const filteredFiles = files.filter(f =>
    /\.[tj]sx?$/g.test(path.extname(f.afterName))
  )
  return filteredFiles
}
