export default [
  {
    id: 'PROMISE_ALL_USAGE',
    regex: /\bPromise\.all\b/i,
    description:
      'Executing Promise.all(items.map(async => { … })) leads to the creation of an undefined number of Promises, each executing something asynchronous and possibly saturating the event loop and consuming too much memory. Use a library like sindresorhus/p-map or sindresorhus/p-all instead.'
  },
  {
    id: 'JSON_PARSE_USAGE',
    regex: /\bJSON\.parse\b/,
    description:
      'JSON.parse should be avoided in favor of a more secure alternative like fastify/secure-json-parse.'
  },
  {
    id: 'MD5_USAGE',
    regex: /\bMD5\b/i,
    description: 'Do not use MD5, use a better hashing algorithm like SHA256.'
  },
  {
    id: 'LOCALSTORAGE_USAGE',
    regex: /\blocalStorage\b/,
    description:
      "Avoid using localStorage for sensitive data as it's vulnerable to XSS attacks. Consider using HttpOnly cookies or other server-side storage solutions."
  },
  {
    id: 'EVAL_USAGE',
    regex: /eval\(/,
    description:
      'Avoid the use of `eval()`, as it poses security risks and can execute arbitrary code. Consider safer alternatives, or parse data without execution.'
  },
  {
    id: 'AVOID_VAR',
    regex: /var\s+\w+/,
    description:
      'Using `var` for variable declarations can lead to hoisting-related issues. Consider using `let` or `const` for block-scoped variables.'
  }
]
