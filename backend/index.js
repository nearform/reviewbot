import Fastify from "fastify";

function app() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
    },
  });

  fastify.register(import("./routes/review.js"));

  return fastify;
}

export default app;
