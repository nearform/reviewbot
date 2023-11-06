import buildPrompt from './prompt-engine.js'
import generateSuggestions from './suggestions.js'
import { mapLineToDiff } from 'map-line-to-diff'

/**
  Creates suggestions for each file in a git diff using the ChatGPT transformer API.
  @param {Object[]} gitDiff - The git diff object containing changes & metadata for each file.
  @returns {Promise<Object[]>} - A promise that resolves to an array of objects containing suggestions for each file.
  @throws {Error} If an error occurs while creating suggestions.
 */
async function createLLMSuggestions(gitDiff) {
  const prompts = buildPrompt(gitDiff)
  const response = await Promise.all(
    prompts.map(async filePrompt => {
      let suggestionsForFile = {}

      const transformerResponse = await generateSuggestions({
        transformerType: 'chatGPT',
        payload: filePrompt.changes
      })
      // console.log(transformerResponse)
      transformerResponse.forEach((suggestion, index) => {
        suggestionsForFile = {
          filename: filePrompt.fileName,
          lineRange: filePrompt.changes[index].range,
          diff: filePrompt.changes[index].diff,
          suggestions: suggestion
        }
      })

      return suggestionsForFile
    })
  )
  return response
}

function transformSuggestionsIntoComments(suggestions, rawDiff) {
  const comments = suggestions.map(f => {
    return {
      path: f.filename,
      position: mapLineToDiff(rawDiff, f.filename, f.lineRange.start),
      body: f.suggestions
    }
  })
  return comments
}

export async function createLLMPRComments(gitDiff, rawDiff) {
  const suggestions = await createLLMSuggestions(gitDiff)
  const comments = transformSuggestionsIntoComments(suggestions, rawDiff)
  return comments
}

export default createLLMSuggestions
