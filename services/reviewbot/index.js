import promptEngine from './prompt-engine.js'
import suggestions from './suggestions.js'

const reviewBotService = {
  createSuggestions: async function createSuggestions(gitDiff) {
    const prompts = promptEngine.build(gitDiff)
    const response = await Promise.all(
      prompts.map(async file => {
        let suggestionsForFile = {}

        const transformerResponse = await suggestions.create({
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
}

export default reviewBotService
