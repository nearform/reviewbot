import * as dotenv from 'dotenv'
import { createLLMPRComments } from './llm/index.js'
import { createASTPRComments } from './astParsing/index.js'
import { createRegexComments } from './regex/index.js'
import { REVIEW_TYPE, filterOutInvalidComments } from './utils.js'
import getOctokit from './oktokit/index.js'
import pino from 'pino'

const logger = pino({ name: 'reviewbot' })

dotenv.config()
/**
 * Event listener function that is invoked when a new message is received.
 * @param {import('@google-cloud/pubsub').Message} message - The message object.
 * @return {void}
 */
export default async function app(message) {
  logger.info('createReview')

  const messageContext = JSON.parse(
    Buffer.from(message.data, 'base64').toString()
  )

  let comments = []

  if (messageContext.reviewType === REVIEW_TYPE.LLM) {
    logger.info('Creating LLM review comments')
    comments = await createLLMPRComments(
      messageContext.files,
      messageContext.diff
    )
  } else if (messageContext.reviewType === REVIEW_TYPE.RuleBased) {
    logger.info('Creating rule based review comments')
    const astComments = createASTPRComments(
      messageContext.files,
      messageContext.fullFiles,
      messageContext.diff
    )

    const regexpComments = createRegexComments(
      messageContext.files,
      messageContext.diff
    )

    comments = astComments.concat(regexpComments)
  } else {
    logger.warn(
      'Received a message but could not determine the type of review requested. Ignoring the message.'
    )
    return
  }

  comments = filterOutInvalidComments(comments)

  logger.info(
    `creating review with ${comments.length} comments for commit ${messageContext.latestCommit}`
  )

  const octokit = await getOctokit(messageContext.installationId)

  if (comments.length > 0) {
    await octokit.rest.pulls.createReview({
      repo: messageContext.repo,
      owner: messageContext.owner,
      pull_number: messageContext.pull_number,
      commit_id: messageContext.latestCommit,
      body: 'Please take a look at my comments.',
      event: 'COMMENT',
      comments: comments
    })
  } else {
    await octokit.rest.pulls.createReview({
      repo: messageContext.repo,
      owner: messageContext.owner,
      pull_number: messageContext.pull_number,
      commit_id: messageContext.latestCommit,
      body: 'Looks good! No comments.',
      event: 'COMMENT',
      comments: []
    })
  }

  logger.info('review finished')
}
