import { filterAcceptedFiles, filterOnlyModified } from '../utils.js'
import regexRules from './rules.js'
import { mapLineToDiff } from 'map-line-to-diff'

/**
 * Finds and returns issues from a given diff string based on a set of regex rules.
 *
 * @param {string} diff - The diff string to analyze.
 * @param {Array<Object>} rules - An array of rules where each rule object should contain:
 *   - `id` {string} The unique identifier for the rule.
 *   - `regex` {RegExp} The regular expression to test against the diff content.
 *   - `prompt` {string} The description or prompt for the rule.
 * @returns {Array<Object>} An array of issues found. Each issue object contains:
 *   - `lineNumber` {number} The line number in the diff where the issue was found.
 *   - `id` {string} The id of the rule that matched.
 *   - `description` {string} The description or prompt of the rule that matched.
 */
export const findRegexRulesInLine = (lineContent, rules) => {
  const issues = []

  for (let rule of rules) {
    if (rule.regex.test(lineContent)) {
      issues.push(rule)
    }
  }

  return issues
}

export const createRegexSuggestions = gitDiff => {
  const acceptedFiles = filterAcceptedFiles(gitDiff)
  const filesWithModifiedLines = filterOnlyModified(acceptedFiles)
  const filesWithAddDiff = filesWithModifiedLines.filter(file => file.added)

  const comments = []

  filesWithAddDiff.forEach(file => {
    file.modifiedLines.forEach(line => {
      if (!line.added) return
      const lineSuggestions = findRegexRulesInLine(line.line, regexRules).map(
        rule => rule.description
      )
      if (lineSuggestions.length === 0) return

      comments.push({
        path: file.afterName,
        lineNumber: line.lineNumber,
        body: lineSuggestions
      })
    })
  })

  return comments
}

function transformSuggestionsIntoComments(suggestions, rawDiff) {
  const comments = suggestions.map(s => {
    return {
      path: s.path,
      position: mapLineToDiff(rawDiff, s.filename, s.lineNumber),
      body: s.body
    }
  })
  return comments
}

export const createRegexComments = (gitDiff, rawDiff) => {
  const suggestions = createRegexSuggestions(gitDiff)
  return transformSuggestionsIntoComments(suggestions, rawDiff)
}
