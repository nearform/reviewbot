import createSuggestions from '../create-suggestions/index.js'
import findLinePositionInDiff from '../utils.js'

export default async function createReview(context, messageContext) {
  console.log('[reviewbot] - scheduling review request', messageContext)

  const filesWithSuggestions = await createSuggestions(messageContext.files)

  const comments = filesWithSuggestions.map(f => ({
    path: f.filename,
    position: findLinePositionInDiff(
      messageContext.diff,
      f.filename,
      f.lineRange.start
    ),
    body: f.suggestions
  }))

  console.log(
    `[reviewbot] - creating review for commit ${messageContext.latestCommit}`
  )

  await context.octokit.rest.pulls.createReview({
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
