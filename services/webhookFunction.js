import { createNodeMiddleware, createProbot } from "probot";

import app from "./webhookApp.js";

const webhook = (req, res) =>
  createNodeMiddleware(app, { probot: createProbot() })(req, res);

export default webhook;
