import webhookHandler from './functions/webhook/function.js'
import createReviewHandler from './functions/createReview/function.js'

export const createReview = createReviewHandler
export const webhook = webhookHandler

