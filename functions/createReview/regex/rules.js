export default [
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
  }
]
