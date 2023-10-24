import path from 'node:path'

export function filterOnlyModified(files) {
  return files.map(file => ({
    ...file,
    modifiedLines: file.modifiedLines.filter(line => line.added)
  }))
}

export function filterAcceptedFiles(files) {
  const filteredFiles = files.filter(
    f =>
      path.extname(f.afterName) === '.js' || path.extname(f.afterName) === '.ts'
  )
  return filteredFiles
}

export function groupByLineRange({ modifiedLines }) {
  const output = []
  let range = { start: 0, end: 0 }
  let diff = ''
  for (let i = 0; i < modifiedLines.length; i++) {
    const { lineNumber, line } = modifiedLines[i]
    if (range.start === 0) {
      range.start = lineNumber
      range.end = lineNumber
      diff += line.trim()
    } else if (lineNumber === range.end + 1) {
      range.end = lineNumber
      diff += line.trim()
    }
  }
  output.push({ range, diff })
  return output
}

function enhanceWithPromptContext(change) {
  const promptContext = `
        You will take in a git diff, and tell the user what they could have improved (like a code review)
        based on analyzing the git diff in order to see whats changed.
        The language in the snippet is JavaScript.
        Feel free to provide any examples as markdown code snippets in your answer.
  
        ${change}
      `
  return [
    {
      role: 'system',
      content: `You are are a senior software engineer and an emphathetic code reviewer.`
    },
    { role: 'user', content: promptContext }
  ]
}

/**
  Builds prompts for each file in a given payload by filtering and grouping only modified lines.
  @param {Object[]} payload - The payload containing the files to build prompts for.
  @returns {Object[]} - An array of objects containing file names and an array of changes with prompts for each file.
**/
function buildPrompt(payload) {
  const acceptedFiles = filterAcceptedFiles(payload)
  const filesWithModifiedLines = filterOnlyModified(acceptedFiles)
  const result = filesWithModifiedLines.map(file => {
    return {
      fileName: file.afterName,
      changes: groupByLineRange(file).map(change => ({
        ...change,
        prompt: enhanceWithPromptContext(change.diff)
      }))
    }
  })
  console.log('[reviewbot] - building prompts', result)
  return result
}

export default buildPrompt
