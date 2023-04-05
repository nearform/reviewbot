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

export default getOctokit
