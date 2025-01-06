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

These steps assume you have already installed the `reviewbot` Github app on a repo.
### ngrok

There are a couple of high level steps to get local development working with [ngrok](https://ngrok.com/).
- Run `npm run dev` to start the development `Probot` app
- Configure/Start ngrok
  - `ngrok http 4000`
- Update the Github app settings > Webhook URL with `{YOUR_NGROK_URL}`

### gcloud

To emulate the Pub/Sub behaviour from `gcloud`, we can run some of the services locally.

Before running, ensure that you have followed the [steps here](https://cloud.google.com/pubsub/docs/emulator#before-you-begin) to install the JDK & `gcloud` CLI tool.

- Open a terminal and start the emulator.
  - `gcloud beta emulators pubsub start --project=reviewbot --host-port=0.0.0.0:8829`
- Run the dev scripts
  - `npm run dev:pubsub` (start the pub/sub message service)

To test that everything is setup correctly. Try tagging the bot in a comment on a repo where you have it installed
  - `/reviewbot review`

[![banner](https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg)](https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages)
