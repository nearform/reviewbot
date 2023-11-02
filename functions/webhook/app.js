import { PubSub } from '@google-cloud/pubsub'
import parseGitPatch from './parseGitPatch.js'
import { getPRContent } from '../createReview/oktokit/index.js'
/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Probot} app
 */
export default async app => {
  console.log('[reviewbot] - server started')

  /*  For the MVP, it's fine to just listen for this event.
      In the future, we would want to handle different scenarios such as:
      - pull_request_review_comment.created
      - pull_request_review_comment.edited */

  app.on(['issue_comment'], async context => {
    try {
      const { body, user } = context.payload.comment

      if (user.type === 'Bot') {
        return
      }

      const botCall = '/reviewbot review'
      if (body.indexOf(botCall) === -1) {
        return
      }

      const issue = context.issue()
      const pullRequest = context.pullRequest()

      const common = {
        owner: issue.owner,
        repo: issue.repo
      }

      console.log('[reviewbot] - getting git diff for files changed')

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
        console.log(commits)
        console.error(
          `[reviewbot] - could not find list of commits for pull request ${pullRequest.pull_number}`
        )
        return
      }

      const shaList = commits.map(c => c.sha)

      console.log('[reviewbot] - list commits', shaList)

      const latestCommit = shaList[shaList.length - 1]

      if (!latestCommit) {
        console.error('[reviewbot] - could not find latest commit')
        return
      }

      let fullFiles = await getPRContent(context)

      const messageContext = {
        ...common,
        pull_number: pullRequest.pull_number,
        diff,
        latestCommit,
        files,
        installationId: context.payload.installation.id,
        fullFiles
      }

      const pubsub = new PubSub({
        projectId: process.env.PROJECT_ID,
        apiEndpoint: process.env.PUBSUB_HOST
      })

      const topic = pubsub.topic(process.env.TOPIC_NAME)
      const [topicExists] = await topic.exists()

      if (!topicExists) {
        await topic.create()
      }

      const messageId = await topic.publishMessage({ json: messageContext })

      console.log('[reviewbot] - ack author comment', messageId)

      await context.octokit.reactions.createForIssueComment({
        content: 'eyes',
        comment_id: context.payload.comment.id,
        ...common
      })
    } catch (error) {
      console.error(error)
      console.error(`[reviewbot] - encountered an error - ${error.message}`)
    }
  })
}
