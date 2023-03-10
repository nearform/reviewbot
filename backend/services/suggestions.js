const suggestions = {
  async create({ transformerType, payload }) {
    switch (transformerType) {
      case "chatGPT": {
        // handle ChatGPT
        console.log("handle chat gpt");
      }
    }
  },
};

export default suggestions;
