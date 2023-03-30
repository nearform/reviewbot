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
  - `ngrok http 4000`
- Update the Github app settings > Webhook URL with `{YOUR_NGROK_URL}`

### gcloud

To emulate the Pub/Sub behaviour locally, we can use Docker to run the service locally:

- `docker run --name pubsub-emulator -p 8085:8085 -d google/cloud-sdk gcloud beta emulators pubsub start --host-port=0.0.0.0:8085`

This will create a new Docker container with the name `pubsub-emulator`, maps the Pub/Sub emulator port 8085 to the local port 8085, and starts the Pub/Sub emulator with the `--host-port=0.0.0.0:8085` option to allow incoming connections from outside the container.

Next, ensure that the `PUBSUB_HOST` env variable is pointing to the local Pub/Sub emulator. See `.env.example`.

