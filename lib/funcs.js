'use strict'

/**
 * Find a node in parse5 object tree.
 * @param {Object} tree parse5 tree object.
 * @param {[string, number][]} [path] Root path.
 * @param {function} visit (node, path) => object.
 *   Return object if a node is found. This will stop searching.
 * @returns {Object|undefined} A visit function result.
 */
function search(tree, path, visit) {
  if (typeof path === 'function') {
    visit = path
    path = [['', 1]]
  }

  const found = visit(tree, path)
  if (found) { return found }

  if (!tree.childNodes) { return }

  const nodeCount = new Map() // node tag name => counter

  for (const subNode of tree.childNodes) {
    const subNodeName = subNode.tagName
    nodeCount.set(subNodeName, (nodeCount.get(subNodeName) || 0) + 1)

    const subPath = [...path, [subNodeName, nodeCount.get(subNodeName)]]

    const subFound = search(subNode, subPath, visit)
    if (subFound) { return subFound }
  }
}

/**
 * Return a node if id's are matched. Use with the search function.
 * id => node => node|undefined.
 * @param {string} id Id to compare.
 * @param {Object} node parse5 node object.
 * @returns {node|undefined}
 */
const returnIfIdEqual = id => node => {
  if (!node.attrs) { return }

  const idAttr = node.attrs.find(attr => attr.name === 'id')
  if (!idAttr) { return }

  if (idAttr.value === id) {
    return node
  }
}

/**
 * Find matches in a tree.
 * @param {Object} tree parse5 tree object.
 * @param {function} getScore (node, path) => number. Returns matching score.
 *   Returns 0 if a node is not matched.
 * @returns {{node: Object, path: [string, number][], score: number}[]}
 *   The result will be sorted by score DESC.
 */
function match(tree, getScore) {
  const matches = []

  search(tree, (node, path) => {
    const score = getScore(node, path)
    if (score > 0) {
      matches.push({node, path, score})
    }
  })

  return matches.sort((m1, m2) => m2.score - m1.score)
}

/**
 * Calc a score by attributes matching. Use with the match function.
 * originNode => node => number.
 * @param {Object} originNode original parse5 node object.
 * @param {Object} node current parse5 node object.
 * @returns {number} score
 */
function getAttrsScore(originNode) {
  const originAttrs = {} // name => value
  originNode.attrs.forEach(attr => originAttrs[attr.name] = attr.value)

  return node => {
    if (node.tagName !== originNode.tagName || !node.attrs) { return 0 }

    let score = 0
    node.attrs.forEach(attr => {
      if (attr.value === originAttrs[attr.name]) {
        score++
      }
    })

    return score
  }
}

/**
 * Convert path in array format to string format.
 * @param {[string, number][]} path e.g. [['', 1], ['html', 1], ['body', 1], ['div', 3]]
 * @returns {string} e.g. /html/body/div[3]
 */
function pathToString(path) {
  return path.map(ar => ar[1] > 1 ? `${ar[0]}[${ar[1]}]` : ar[0]).join('/')
}

module.exports = {
  search,
  returnIfIdEqual,
  match,
  getAttrsScore,
  pathToString,
}
