import buildPrompt from './prompt-engine.js'
import generateSuggestions from './suggestions.js'

/**
  Creates suggestions for each file in a git diff using the ChatGPT transformer API.
  @param {Object[]} gitDiff - The git diff object containing changes & metadata for each file.
  @returns {Promise<Object[]>} - A promise that resolves to an array of objects containing suggestions for each file.
  @throws {Error} If an error occurs while creating suggestions.
 */
async function createSuggestions(gitDiff) {
  const prompts = buildPrompt(gitDiff)
  const response = await Promise.all(
    prompts.map(async file => {
      let suggestionsForFile = {}

      const transformerResponse = await generateSuggestions({
        transformerType: 'chatGPT',
        payload: file.changes
      })

      transformerResponse.forEach((suggestion, index) => {
        suggestionsForFile = {
          filename: file.fileName,
          lineRange: file.changes[index].range,
          diff: file.changes[index].diff,
          suggestions: suggestion
        }
      })

      return suggestionsForFile
    })
  )
  return response
}

export default createSuggestions
