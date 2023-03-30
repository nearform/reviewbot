import { Octokit } from 'octokit'
import { createAppAuth } from '@octokit/auth-app'
import { getPrivateKey } from '@probot/get-private-key'

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
