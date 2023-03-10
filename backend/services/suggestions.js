import * as dotenv from "dotenv";

dotenv.config();

const suggestions = {
  buildMessages(payload) {},
  async create({ transformerType, payload }) {
    switch (transformerType) {
      case "chatGPT": {
        try {
          const apiUrl = "https://api.openai.com/v1/completions";
          const messages = this.buildMessages(payload);
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CHAT_GPT_API_KEY}`,
            },
            body: JSON.stringify({
              model: "text-davinci-003",
              prompt: "Say this is a test",
            }),
          });
          const body = await response.json();
          console.log(body);
        } catch (error) {
          throw new Error(`received error from chatGPT API + ${error.message}`);
        }
      }
    }
  },
};

export default suggestions;
