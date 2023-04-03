import { PubSub } from '@google-cloud/pubsub'
import createReview from './functions/createReview/app.js'

const { PUBSUB_HOST, PROJECT_ID, TOPIC_NAME, SUBSCRIPTION_NAME } = process.env

/**
 * Note: This script is only intended for development.
 *
 * Initializes and starts the Google Cloud Pub/Sub emulator with the specified
 * topic and subscription settings. If the topic or subscription does not
 * exist, it creates them with the provided configuration.
 *
 * @returns {Promise<void>} A Promise that resolves when the Pub/Sub emulator is
 *                           started and the topic and subscription are ready.
 * @throws {Error} Throws an error if there is an issue with the Pub/Sub
 *                 initialization or if the topic or subscription cannot be
 *                 created.
 **/
async function startPubsub() {
  const apiEndpoint = PUBSUB_HOST
  console.log(`Listening to the Pub/Sub emulator event at: ${apiEndpoint}`)
  const pubsub = new PubSub({
    apiEndpoint,
    projectId: PROJECT_ID
  })
  const topic = pubsub.topic(TOPIC_NAME)
  const [topicExists] = await topic.exists()
  if (!topicExists) {
    await topic.create()
  }
  const subscription = pubsub.subscription(SUBSCRIPTION_NAME)
  const [subscriptionExists] = await subscription.exists()
  if (!subscriptionExists) {
    topic.createSubscription(SUBSCRIPTION_NAME)
  }
  subscription.on('message', async message => {
    await createReview(message)
    message.ack()
  })
}

startPubsub()
