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

There are a couple of high level steps to get local development working with [ngrok](https://ngrok.com/).
- Run `npm run dev` to start the development `Probot` app
- Configure/Start ngrok
  - `ngrok http 3000`
- Update the Github app settings > Webhook URL with `{YOUR_NGROK_URL}`

