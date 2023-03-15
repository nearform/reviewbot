import parseGitPatch from 'parse-git-patch'
import reviewBotService from './reviewbot/index.js'

/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Probot} app
 */
export default async app => {
  console.log('[reviewbot] - server started')

  /*  For the MVP, it's fine to just listen for this event.
      In the future, we would want to handle different scenarios such as:
      - issue_comment.edited
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

      const { files, hash } = parseGitPatch.default(diff)

      // push event on topic...
      console.log('[reviewbot] - scheduling review request')

      const filesWithSuggestions = await reviewBotService.createSuggestions([
        files[0]
      ])

      const comments = filesWithSuggestions.map(f => {
        return context.octokit.pulls.createReviewComment({
          ...common,
          pull_number: pullRequest.pull_number,
          path: f.filename,
          body: f.suggestions,
          start_line: f.lineRange.start,
          // line === end line when using multi line comments
          line: f.lineRange.end,
          start_side: 'RIGHT',
          commit_id: hash
        })
      })
      await Promise.all(comments)
    } catch (error) {
      console.error(`[reviewbot] - encountered an error - ${error.message}`)
    }
  })
}
