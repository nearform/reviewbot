/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Probot} app
 */
module.exports = async (app) => {
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

    try {
      const issue = context.issue();
      const { body } = context.payload.comment;

      const botCall = "/reviewbot review";
      if (body.indexOf(botCall) === -1) {
        return;
      }

      app.log.info("[reviewbot] - getting git diff for files changed");

      const pullRequest = context.pullRequest();
      const { data } = await context.octokit.pulls.listFiles({
        owner: issue.owner,
        repo: issue.repo,
        pull_number: pullRequest.pull_number,
      });

      app.log.info("[reviewbot] - ack author comment");

      await context.octokit.reactions.createForIssueComment({
        content: "eyes",
        comment_id: context.payload.comment.id,
        owner: issue.owner,
        repo: issue.repo,
      });

      app.log.info("[reviewbot] - scheduling review request");

      // Create a review request
      const payload = data.map((file) => ({
        filename: file.filename,
        patch: file.patch,
      }));

      const response = await fetch(process.env.REVIEWBOT_SERVICE, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) {
        app.log.error("[reviewbot] - error scheduling review request");
        throw new Error(
          `received status code ${response.status} instead of 201`
        );
      }
    } catch (error) {
      app.log.error(`[reviewbot] - encountered an error - ${error.message}`);
    }
  });
};
