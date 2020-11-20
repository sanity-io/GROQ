const specMarkdown = require('spec-md')
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

async function main() {
  const html = await specMarkdown.html(`./spec/GROQ.md`)
  await writeFile('./docs/index.html', html)
  console.log('Generated docs/')
}

main()
