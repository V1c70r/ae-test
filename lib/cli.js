'use strict'

const fs = require('fs')
const parse5 = require('parse5')

const {search, returnIfIdEqual, match, getAttrsScore, pathToString} = require('./funcs')

if (process.argv.length < 4) {
  console.log('Usage: node lib/cli.js <originFilePath> <sampleFilePath> [originNodeId]')
  process.exit(1)
}

const originFilePath = process.argv[2]
const sampleFilePath = process.argv[3]
const originNodeId = process.argv[4] || 'make-everything-ok-button'

const originTree = parse5.parse(fs.readFileSync(originFilePath, 'utf-8'))
const sampleTree = parse5.parse(fs.readFileSync(sampleFilePath, 'utf-8'))

const originNode = search(originTree, returnIfIdEqual(originNodeId))
if (!originNode) {
  throw new Error('Can not find an origin node.')
}

const matches = match(sampleTree, getAttrsScore(originNode))
if (matches.length === 0) {
  throw new Error('Can not find any matches in a sample tree.')
}

// console.log(matches[0].node)
// console.log(matches[0].score)
console.log(pathToString(matches[0].path))
