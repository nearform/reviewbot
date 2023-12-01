import { describe, test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import parseGitPatch from '../../../functions/webhook/parseGitPatch.js'

import path from 'path'
import url from 'url'
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('Parsing git patches', () => {
  test('nominal - single file', () => {
    const rawGitPatch = readFileSync(
      path.join(__dirname, 'fixture.nominal_single_file.diff'),
      'utf8'
    )
    const parsedGitPatch = parseGitPatch(rawGitPatch)

    assert.deepEqual(parsedGitPatch, {
      files: [
        {
          added: false,
          deleted: false,
          beforeName: 'functions/webhook/triggerReviews.js',
          afterName: 'functions/webhook/triggerReviews.js',
          modifiedLines: [
            {
              added: false,
              lineNumber: 88,
              line: "  return payload.pull_request && payload.action === 'ready_for_review'"
            },
            {
              added: true,
              lineNumber: 88,
              line: '  const pullRequest = payload.pull_request'
            },
            {
              added: true,
              lineNumber: 89,
              line: '  return ('
            },
            {
              added: true,
              lineNumber: 90,
              line: '    pullRequest &&'
            },
            {
              added: true,
              lineNumber: 91,
              line: "    pullRequest.user.type === 'User' &&"
            },
            {
              added: true,
              lineNumber: 92,
              line: "    (payload.action === 'ready_for_review' ||"
            },
            {
              added: true,
              lineNumber: 93,
              line: "      (payload.action === 'opened' && pullRequest.draft === false))"
            },
            {
              added: true,
              lineNumber: 94,
              line: '  )'
            }
          ]
        }
      ]
    })
  })

  test('nominal - multi files', () => {
    const rawGitPatch = readFileSync(
      path.join(__dirname, 'fixture.nominal_multi_files.diff'),
      'utf8'
    )
    const parsedGitPatch = parseGitPatch(rawGitPatch)

    assert.deepEqual(parsedGitPatch, {
      files: [
        {
          added: false,
          deleted: false,
          beforeName: 'package.json',
          afterName: 'package.json',
          modifiedLines: [
            {
              added: false,
              lineNumber: 5,
              line: '  "main": "dist/index.js",'
            },
            {
              added: true,
              lineNumber: 5,
              line: '  "exports": {'
            },
            {
              added: true,
              lineNumber: 6,
              line: '    ".": "./dist/index.js",'
            },
            {
              added: true,
              lineNumber: 7,
              line: '    "./plugin": "./dist/plugin.js"'
            },
            {
              added: true,
              lineNumber: 8,
              line: '  },'
            }
          ]
        },
        {
          added: true,
          deleted: false,
          beforeName: 'src/plugin.js',
          afterName: 'src/plugin.js',
          modifiedLines: [
            {
              added: true,
              lineNumber: 1,
              line: "const quantumConfig = require('../tailwind.config.js')"
            },
            {
              added: true,
              lineNumber: 2,
              line: "const plugin = require('tailwindcss/plugin')"
            },
            {
              added: true,
              lineNumber: 3,
              line: ''
            },
            {
              added: true,
              lineNumber: 4,
              line: 'const quantumPlugin = plugin(() => {}, {'
            },
            {
              added: true,
              lineNumber: 5,
              line: '  theme: {'
            },
            {
              added: true,
              lineNumber: 6,
              line: '    ...quantumConfig.theme'
            },
            {
              added: true,
              lineNumber: 7,
              line: '  }'
            },
            {
              added: true,
              lineNumber: 8,
              line: '})'
            },
            {
              added: true,
              lineNumber: 9,
              line: ''
            },
            {
              added: true,
              lineNumber: 10,
              line: 'module.exports = quantumPlugin'
            }
          ]
        },
        {
          added: false,
          deleted: false,
          beforeName: 'tsup.config.ts',
          afterName: 'tsup.config.ts',
          modifiedLines: [
            {
              added: false,
              lineNumber: 4,
              line: "  entry: ['src/index.ts', 'src/global.css', 'src/colors/index.ts'],"
            },
            {
              added: true,
              lineNumber: 4,
              line: '  entry: ['
            },
            {
              added: true,
              lineNumber: 5,
              line: "    'src/index.ts',"
            },
            {
              added: true,
              lineNumber: 6,
              line: "    'src/global.css',"
            },
            {
              added: true,
              lineNumber: 7,
              line: "    'src/colors/index.ts',"
            },
            {
              added: true,
              lineNumber: 8,
              line: "    'src/plugin.js'"
            },
            {
              added: true,
              lineNumber: 9,
              line: '  ],'
            }
          ]
        }
      ]
    })
  })

  test('Leading blank line is counted', () => {
    const rawGitPatch = readFileSync(
      path.join(__dirname, 'fixture.leading_blank_line.diff'),
      'utf8'
    )
    const parsedGitPatch = parseGitPatch(rawGitPatch)

    assert.ok(parsedGitPatch.files)
    assert.equal(parsedGitPatch.files.length, 1)
    assert.deepEqual(parsedGitPatch.files[0], {
      added: false,
      deleted: false,
      beforeName: 'src/App.tsx',
      afterName: 'src/App.tsx',
      modifiedLines: [
        {
          added: true,
          lineNumber: 8,
          line: "  console.log('hello world')"
        }
      ]
    })
  })
})
