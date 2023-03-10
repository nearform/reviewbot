import promptEngine from "../services/prompt-engine.js";
import suggestions from "../services/suggestions.js";

export default async function review(fastify) {
  fastify.post(
    "/review",
    {
      schema: {
        response: {
          200: {
            description: "Success Response",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const dynamicPrompt = promptEngine.build(request.body);
      const response = await suggestions.create({
        transformerType: "chatGPT",
        payload: dynamicPrompt,
      });
      return response;
    }
  );
}
