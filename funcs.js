'use strict'

/**
 * Find an element in xml-js object tree.
 * @param {Object} tree Parsed xml-js tree.
 * @param {[string, number][]} [path] Root path.
 * @param {function(node, path)} visit Return object if an element is found. This will stop searching.
 * @returns {Object|undefined} A visit function result.
 */
function search(tree, path, visit) {
  if (typeof path === 'function') {
    visit = path
    path = []
  }

  const found = visit(tree, path)
  if (found) { return found }

  if (!tree.elements) { return }

  const nodeCount = new Map() // node name => counter

  for (const subNode of tree.elements) {
    const subNodeName = subNode.name
    nodeCount.set(subNodeName, (nodeCount.get(subNodeName) || 0) + 1)

    const subPath = path.slice()
    subPath.push([subNodeName, nodeCount.get(subNodeName)])

    const subFound = search(subNode, subPath, visit)
    if (subFound) { return subFound }
  }
}

/**
 * Find matches in a sample tree with original node.
 * @param {Object} originNode Element in xml-js format.
 * @param {Object} sampleTree Parsed xml-js tree.
 * @returns {{node: Object, path: [string, number][], score: number}[]} The result will be sorted by score DESC.
 */
function match(originNode, sampleTree) {
  const originAttrs = Object.entries(originNode.attributes).map(([key, value]) => ({key, value}))
  const matches = []

  search(sampleTree, (node, path) => {
    if (node.name !== originNode.name) { return }

    let score = 0

    originAttrs.forEach(originAttr => {
      if (node.attributes[originAttr.key] === originAttr.value) {
        score += (originAttr.key === 'id' ? 5 : 1)
      }
    })

    if (score > 0) {
      matches.push({node, path, score})
    }
  })

  return matches.sort((m1, m2) => m2.score - m1.score)
}

/**
 * Convert path in array format to string format.
 * @param {[string, number]} path e.g. [['html', 1], ['body', 1], ['div', 3]]
 * @returns {string} e.g. /html/body/div[3]
 */
function pathToString(path) {
  return '/' + path.map(ar => ar[1] > 1 ? `${ar[0]}[${ar[1]}]` : ar[0]).join('/')
}

module.exports = {
  search,
  match,
  pathToString,
}
