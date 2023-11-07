import { PubSub } from '@google-cloud/pubsub'
import parseGitPatch from './parseGitPatch.js'
import { getPRContent } from '../createReview/oktokit/index.js'
import pino from 'pino'

const logger = pino({ name: 'reviewbot' })

async function fetchGithubData(context) {
  const issue = context.issue()
  const pullRequest = context.pullRequest()

  const common = {
    owner: issue.owner,
    repo: issue.repo
  }
  logger.info('getting git diff for files changed')
  const { data: diff } = await context.octokit.rest.pulls.get({
    ...common,
    pull_number: pullRequest.pull_number,
    mediaType: {
      format: 'diff'
    }
  })

  const { files } = parseGitPatch(diff)
  const { data: commits } = await context.octokit.pulls.listCommits({
    ...common,
    pull_number: pullRequest.pull_number
  })
  if (!Array.isArray(commits) || commits.length === 0) {
    logger.error({ commits })
    logger.error(
      `could not find list of commits for pull request ${pullRequest.pull_number}`
    )
    return
  }
  const shaList = commits.map(c => c.sha)

  logger.info('list commits', shaList)

  const latestCommit = shaList[shaList.length - 1]

  if (!latestCommit) {
    logger.error('could not find latest commit')
    return
  }

  let fullFiles = await getPRContent(context)

  return {
    ...common,
    pull_number: pullRequest.pull_number,
    diff,
    latestCommit,
    files,
    installationId: context.payload.installation.id,
    fullFiles
  }
}

async function publishMessage(messageContent) {
  const pubsub = new PubSub({
    projectId: process.env.PROJECT_ID,
    apiEndpoint: process.env.PUBSUB_HOST
  })

  const topic = pubsub.topic(process.env.TOPIC_NAME)
  const [topicExists] = await topic.exists()

  if (!topicExists) {
    await topic.create()
  }

  return await topic.publishMessage({ json: messageContent })
}

export function shouldTriggerLLMReview(payload) {
  return (
    payload.comment &&
    payload.action === 'created' &&
    payload.comment.user.type !== 'Bot' &&
    payload.comment.body.indexOf('/reviewbot review') > -1
  )
}

export function shouldTriggerRuleBasedReview(payload) {
  return payload.pull_request && payload.action === 'ready_for_review'
}

export async function triggerLLMReview(context) {
  const data = await fetchGithubData(context)
  data.reviewType = 'llm'
  const messageId = await publishMessage(data)

  logger.info('ack author comment', { pubsubMessageId: messageId })

  const issue = context.issue()

  await context.octokit.reactions.createForIssueComment({
    owner: issue.owner,
    repo: issue.repo,
    content: 'eyes',
    comment_id: context.payload.comment.id
  })
}

export async function triggerRuleBasedReview(context) {
  const data = await fetchGithubData(context)
  data.reviewType = 'rule_based'
  await publishMessage(data)
}
