import * as dotenv from 'dotenv'
import { createLLMPRComments } from './llm/index.js'
import { createASTPRComments } from './astParsing/index.js'
import getOctokit from './oktokit/index.js'

dotenv.config()
/**
 * Event listener function that is invoked when a new message is received.
 * @param {import('@google-cloud/pubsub').Message} message - The message object.
 * @return {void}
 */
export default async function app(message) {
  console.log('[reviewbot] - createReview', message.data)

  const messageContext = JSON.parse(
    Buffer.from(message.data, 'base64').toString()
  )

  console.log('[reviewbot] - creating suggestions', messageContext)
  const llmComments = await createLLMPRComments(
    messageContext.files,
    messageContext.diff
  )
  const astComments = await createASTPRComments(
    messageContext.files,
    message.fullFiles,
    messageContext.diff
  )

  const comments = llmComments
    .concat(astComments)
    .filter(({ position }) => position > -1)

  console.log(
    `[reviewbot] - creating review for commit ${messageContext.latestCommit}`
  )

  const octokit = await getOctokit(messageContext.installationId)

  await octokit.rest.pulls.createReview({
    repo: messageContext.repo,
    owner: messageContext.owner,
    pull_number: messageContext.pull_number,
    commit_id: messageContext.latestCommit,
    body: 'Please take a look at my comments.',
    event: 'COMMENT',
    comments
  })

  console.log('[reviewbot] - review finished')
}
