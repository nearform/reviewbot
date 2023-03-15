const suggestions = {
  async callChatGPTService(payload) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions'
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CHAT_GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: payload,
        max_tokens: 512
      })
    })
    const body = await response.json()
    return body
  },

  _formatResponse(response) {
    return response.map(s =>
      s.choices.map(choice => choice.message.content.trim()).join('')
    )
  },
  async create({ transformerType, payload }) {
    switch (transformerType) {
      case 'chatGPT': {
        try {
          const prompts = payload.map(file =>
            this.callChatGPTService(file.prompt)
          )
          const suggestions = await Promise.all(prompts)

          return this._formatResponse(suggestions)
        } catch (error) {
          throw new Error(`received error from chatGPT API + ${error.message}`)
        }
      }
    }
  }
}

export default suggestions
