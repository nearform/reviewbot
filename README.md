# reviewbot

A bot that assists with code reviews, using AI.

## Usage

Install the Github app and use the following command:
```
/reviewbot review
```

##  Services
- `github-app`
    - contains the probot service that interacts with Github
    - contains the reviewbot service + transformer API interactions

## Docker

```sh
# 1. Build container
docker build -t reviewbot-gha .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> reviewbot-gha
```