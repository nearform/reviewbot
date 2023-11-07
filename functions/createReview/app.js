import * as dotenv from 'dotenv'
import { createLLMPRComments } from './llm/index.js'
import { createASTPRComments } from './astParsing/index.js'
import { createRegexComments } from './regex/index.js'
import getOctokit from './oktokit/index.js'
import { filterOutInvalidComments } from './utils.js'
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

  logger.info('creating suggestions')

  const llmComments = await createLLMPRComments(
    messageContext.files,
    messageContext.diff
  )

  const astComments = createASTPRComments(
    messageContext.files,
    messageContext.fullFiles,
    messageContext.diff
  )

  const regexpComments = createRegexComments(
    messageContext.files,
    messageContext.diff
  )

  const comments = filterOutInvalidComments(
    llmComments.concat(astComments, regexpComments)
  )

  console.log(
    `[reviewbot] - creating review with ${comments.length} comments for commit ${messageContext.latestCommit}`
  )

  const octokit = await getOctokit(messageContext.installationId)

  await octokit.rest.pulls.createReview({
    repo: messageContext.repo,
    owner: messageContext.owner,
    pull_number: messageContext.pull_number,
    commit_id: messageContext.latestCommit,
    body: 'Please take a look at my comments.',
    event: 'COMMENT',
    comments: comments
  })

  logger.info('review finished')
}
