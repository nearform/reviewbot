import promptEngine from "../services/prompt-engine.js";
import suggestions from "../services/suggestions.js";

export default async function review(fastify) {
  fastify.post("/review", {}, async (request, reply) => {
    const prompts = promptEngine.build(request.body);
    const response = await Promise.all(
      prompts.map(async (file) => {
        let suggestionsForFile = {};

        const transformerResponse = await suggestions.create({
          transformerType: "chatGPT",
          payload: file.changes,
        });

        transformerResponse.forEach((suggestion, index) => {
          suggestionsForFile = {
            filename: file.fileName,
            lineRange: file.changes[index].range,
            diff: file.changes[index].diff,
            suggestions: suggestion,
          };
        });

        return suggestionsForFile;
      })
    );

    return reply.status(200).send(response);
  });
}
