'use strict'

const fs = require('fs')
const convert = require('xml-js')

const {search, match, pathToString} = require('./funcs')

if (process.argv.length < 4) {
  console.log('Usage: node index.js <originFilePath> <sampleFilePath> [originElementId]')
  process.exit(1)
}

const originFilePath = process.argv[2]
const sampleFilePath = process.argv[3]
const originElementId = process.argv[4] || 'make-everything-ok-button'

const originFile = fs.readFileSync(originFilePath)
const originTree = convert.xml2js(originFile)

const sampleFile = fs.readFileSync(sampleFilePath)
const sampleTree = convert.xml2js(sampleFile)

const originNode = search(originTree, node => {
  if (!node.attributes) { return }

  if (node.attributes.id === originElementId) {
    return node
  }
})
if (!originNode) {
  throw new Error('Can not find an origin node.')
}

const matches = match(originNode, sampleTree)
if (matches.length === 0) {
  throw new Error('Can not find any matches in a sample tree.')
}

console.log(pathToString(matches[0].path))
