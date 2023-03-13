import * as dotenv from "dotenv";

dotenv.config();

const suggestions = {
  async callChatGPTService(payload) {
    const apiUrl = "https://api.openai.com/v1/completions";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAT_GPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: payload,
        max_tokens: 256,
      }),
    });
    const body = await response.json();
    return body;
  },

  _formatResponse(response) {
    return response.map((s) =>
      s.choices.map((choice) => choice.text.trim()).join("")
    );
  },
  async create({ transformerType, payload }) {
    switch (transformerType) {
      case "chatGPT": {
        try {
          const prompts = payload.map((file) =>
            this.callChatGPTService(file.prompt)
          );
          const suggestions = await Promise.all(prompts);

          return this._formatResponse(suggestions);
        } catch (error) {
          throw new Error(`received error from chatGPT API + ${error.message}`);
        }
      }
    }
  },
};

export default suggestions;
