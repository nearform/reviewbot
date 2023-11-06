export function filterOutInvalidComments(comments) {
  const validComments = []
  const invalidComments = []

  for (let comment of comments) {
    if (comment.position > -1) {
      validComments.push(comment)
    } else {
      invalidComments.push(comment)
      console.error(
        `[reviewbot] - ERROR. Removing generated comment because its position in the diff could not be determined. file=${comment.path}, diff position=${comment.position}]`
      )
    }
  }
  return validComments
}
