import { createNodeMiddleware, createProbot } from "probot";

const app = require("./webhookApp.js");

export const webhook = (req, res) =>
  createNodeMiddleware(app, { probot: createProbot() })(req, res);
