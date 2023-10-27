import { Octokit } from 'octokit'
import { createAppAuth } from '@octokit/auth-app'
import { getPrivateKey } from '@probot/get-private-key'

/**
 * Creates and returns an authenticated Octokit instance
 * for the specified GitHub App installation.
 *
 * @param {number} installationId - The installation ID of the GitHub App.
 * @returns {Promise<Octokit>} A Promise that resolves to an authenticated Octokit instance.
 * @throws {Error} Throws an error if there is an issue with the authentication.
 */
async function getOctokit(installationId) {
  console.log('[reviewbot] - getting octokit', installationId)
  const appAuth = createAppAuth({
    appId: process.env.APP_ID,
    privateKey: getPrivateKey()
  })

  const installationAuth = await appAuth({
    type: 'installation',
    installationId
  })

  return new Octokit({
    auth: installationAuth.token
  })
}

export async function getPRContent(context) {

  const { owner, repo } = context.issue()
  const { pull_number } = context.pullRequest()

  const response = await context.octokit.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  let fullFiles = []
  if(response && response.data) {
    fullFiles = response.data
  }
  const fetchFilesPromises = []
  for (const file of fullFiles) {
    if (file.status === 'modified' || file.status === 'added') {
      fetchFilesPromises.push(
        context.octokit.request('GET /repos/:owner/:repo/contents/:path', {
          owner,
          repo,
          path: file.filename,
          ref: `pull/${pull_number}/head`,
        }).then(response => {
          const content = Buffer.from(response.data.content, 'base64').toString();
          console.log(content)
          file.content = content
        })
      )

    }
  }
  await Promise.all(fetchFilesPromises);

  return fullFiles
}

export default getOctokit
