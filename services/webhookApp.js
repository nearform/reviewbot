import parseGitPatch from 'parse-git-patch'
import createSuggestions from './reviewbot/index.js'
import { findLinePositionInDiff } from './utils.js'

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
      const issue = context.issue()
      const { body, user } = context.payload.comment

      if (user.type === 'Bot') {
        return
      }

      const botCall = '/reviewbot review'
      if (body.indexOf(botCall) === -1) {
        return
      }

      const common = {
        owner: issue.owner,
        repo: issue.repo
      }

      console.log('[reviewbot] - ack author comment')

      await context.octokit.reactions.createForIssueComment({
        content: 'eyes',
        comment_id: context.payload.comment.id,
        ...common
      })

      console.log('[reviewbot] - getting git diff for files changed')

      const pullRequest = context.pullRequest()

      const { data: diff } = await context.octokit.rest.pulls.get({
        ...common,
        pull_number: pullRequest.pull_number,
        mediaType: {
          format: 'patch'
        }
      })

      const { files } = parseGitPatch.default(diff)

      const commits = await context.octokit.pulls.listCommits({
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

      // push event on topic...
      console.log('[reviewbot] - scheduling review request')

      const filesWithSuggestions = await createSuggestions(files)

      const comments = filesWithSuggestions.map(f => ({
        path: f.filename,
        position: findLinePositionInDiff(diff, f.filename, f.lineRange.start),
        body: f.suggestions
      }))

      console.log(`[reviewbot] - creating review for commit ${latestCommit}`)

      await context.octokit.rest.pulls.createReview({
        ...common,
        pull_number: pullRequest.pull_number,
        commit_id: latestCommit,
        body: 'Please take a look at my comments.',
        event: 'COMMENT',
        comments
      })

      console.log('[reviewbot] - review finished')
    } catch (error) {
      console.error(error)
      console.error(`[reviewbot] - encountered an error - ${error.message}`)
    }
  })
}
