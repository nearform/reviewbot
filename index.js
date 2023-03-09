/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("[reviewbot] - server started");

  /*  For the MVP, it's fine to just listen for this event.
      In the future, we would want to handle different scenarios such as:
      - issue_comment.edited
      - pull_request_review_comment.created
      - pull_request_review_comment.edited */

  app.on("issue_comment.created", async (context) => {
    if (context.payload.sender.login === "reviewbot-ai[bot]") {
      return;
    }

    const issue = context.issue();
    const { body } = context.payload.comment;

    const botCall = "/reviewbot review";
    if (body.indexOf(botCall) === -1) {
      return;
    }

    app.log.info("[reviewbot] - scheduling review request");
    // TODO
    // Get the git diff for files changed
    // Create a review request

    return context.octokit.reactions.createForIssueComment({
      content: "eyes",
      comment_id: context.payload.comment.id,
      owner: issue.owner,
      repo: issue.repo,
    });
  });
};
