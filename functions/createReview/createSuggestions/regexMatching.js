import { filterAcceptedFiles, filterOnlyModified } from './prompt-engine.js'
import regexRules from './regexRules.js'

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
export const findRegexRules = (diff, rules) => {
  const issues = []

  diff.split('\n').forEach((content, index) => {
    for (let rule of rules) {
      if (rule.regex.test(content)) {
        issues.push({
          lineNumber: index + 1,
          id: rule.id,
          description: rule.prompt
        })
      }
    }
  })

  return issues
}

export const generateRegexSuggestions = gitDiff => {
  const acceptedFiles = filterAcceptedFiles(gitDiff)
  const filesWithModifiedLines = filterOnlyModified(acceptedFiles)
  const filesWithAddDiff = filesWithModifiedLines.filter(file => file.added)

  const suggestions = []

  filesWithAddDiff.forEach(file => {
    file.modifiedLines.forEach(line => {
      if (!line.added) return
      const lineSuggestions = findRegexRules(line.line, regexRules).map(
        rule => rule.description
      )
      if (!lineSuggestions.length) return

      suggestions.push({
        fileName: file.afterName,
        lineRange: { start: line.lineNumber, end: line.lineNumber },
        diff: line.line,
        suggestions: lineSuggestions
      })
    })
  })

  return suggestions
}
