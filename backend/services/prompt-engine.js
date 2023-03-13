const promptEngine = {
  filterOnlyModified(files) {
    return files.map((file) => ({
      ...file,
      modifiedLines: file.modifiedLines.filter((line) => line.added),
    }));
  },
  groupByLineRange({ modifiedLines }) {
    const output = [];
    let range = { start: 0, end: 0 };
    let diff = "";
    for (let i = 0; i < modifiedLines.length; i++) {
      const { lineNumber, line } = modifiedLines[i];
      if (range.start === 0) {
        range.start = lineNumber;
        range.end = lineNumber;
        diff += line.trim();
      } else if (lineNumber === range.end + 1) {
        range.end = lineNumber;
        diff += line.trim();
      }
    }
    output.push({ range, diff });
    return output;
  },
  enhanceWithPromptContext(change) {
    const promptContext = `
      You are are a senior software engineer and an emphathetic code reviewer.
      You will take in a git diff, and tell the user what they could have improved (like a code review)
      based on analyzing the git diff in order to see whats changed.
      The language in the snippet is JavaScript.
      Feel free to provide any examples as markdown code snippets in your answer.

      ${change}
    `;
    return promptContext;
  },
  build(payload) {
    const filesWithModifiedLines = this.filterOnlyModified(payload);
    const result = filesWithModifiedLines.map((file) => {
      return {
        fileName: file.afterName,
        changes: this.groupByLineRange(file).map((change) => ({
          ...change,
          prompt: this.enhanceWithPromptContext(change.diff),
        })),
      };
    });
    return result;
  },
};

export default promptEngine;
