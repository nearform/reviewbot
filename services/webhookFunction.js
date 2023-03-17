import { createNodeMiddleware, createProbot } from 'probot'

import app from './webhookApp.js'

/**
  Middleware function that handles incoming webhooks.
  @function
  @name webhook
  @param {Object} req - The request object.
  @param {Object} res - The response object.
 */
const webhook = (req, res) =>
  createNodeMiddleware(app, { probot: createProbot() })(req, res)

export default webhook
