# reviewbot

A bot that assists with code reviews, using AI.

## Usage

Install the Github app and use the following command:
```
/reviewbot review
```


This repo contains:
- the probot service that interacts with Github
- the reviewbot service + transformer API interactions (atm we support ChatGPT `gpt-3.5-turbo`)

##  Local Development

### ngrok

These steps assume you have already installed the `reviewbot` Github app on a repo.

There are a few high level steps to get local development working with [ngrok](https://ngrok.com/).
- Run the smee.io Docker image
  - `docker run -p 3000:3000 ghcr.io/probot/smee.io`
- Configure/Start ngrok
  - `ngrok http 3000`
  - Open the `ngrok` generated URL and create a new `smee` channel
- Connect smee npm package with the ngrok url
  - `npx smee --url {YOUR_NGROK_URL} --target http://localhost:{PROBOT_PORT}`
- Run `npm run dev` with `PORT` env variable set to something different than the Docker image.
- Update the Github app settings > Webhook URL with `{YOUR_NGROK_URL}`

