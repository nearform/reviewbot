import {
  shouldTriggerLLMReview,
  triggerLLMReview,
  shouldTriggerRuleBasedReview,
  triggerRuleBasedReview
} from './triggerReviews.js'
import pino from 'pino'

const logger = pino({ name: 'reviewbot' })

/**
 * This is the main entrypoint to the Probot app
 * @param {import('probot').Probot} app
 */
export default async app => {
  logger.info('server started')

  /*  For the MVP, it's fine to just listen for this event.
      In the future, we would want to handle different scenarios such as:
      - pull_request_review_comment.created
      - pull_request_review_comment.edited */

  app.on(['issue_comment', 'push_request'], async context => {
    try {
      if (shouldTriggerLLMReview(context.payload)) {
        await triggerLLMReview(context)
      } else if (shouldTriggerRuleBasedReview(context.payload)) {
        await triggerRuleBasedReview(context)
      }
    } catch (error) {
      logger.error(error)
      logger.error(`encountered an error - ${error.message}`)
    }
  })
}
