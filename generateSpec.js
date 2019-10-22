require('dotenv').config()
const fs = require('fs');
const util = require('util');

const specMarkdown = require('spec-md');
const sanityClient = require('@sanity/client')
const PortableText = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const writeFile = util.promisify(fs.writeFile);

const client = sanityClient({
  projectId: '3do82whm',
  dataset: 'next',
  useCdn: false,
  token: process.env.SANITY_TOKEN
})

function renderChildren(props, divider = '') {
  return Array.isArray(props.children) ? props.children.join(divider) : props.children
}

const BlockRenderer = props => {
  const style = props.node.style || 'normal'

  if (/^h\d/.test(style)) {
    const hashes = new Array(parseInt(style[1], 10) + 1).join('#')
    return `${hashes} ${renderChildren(props)}`
  }
  if (/^note/.test(style)) {
    return `Note: ${renderChildren(props)}`
  }

  if (/^todo/.test(style)) {
    return `TODO: ${renderChildren(props)}`
  }

  return style === 'blockquote'
    ? `> ${renderChildren(props)}`
    : renderChildren(props)
}

const serializers = {
  types: {
    block: BlockRenderer,
    codeExample: ({node: {groq, example, title = ''}}) => `\`\`\`${groq ? 'groq' : example.language || ''}\n${example.code}\n\`\`\``
  },
  marks: {
    literal: props => `{${renderChildren(props)}}`,
    em: props => `*${renderChildren(props)}*`
  }
}

function writeMDFile(name, md) {
  return writeFile(`./spec/${name}.md`, md).catch(console.error)
}

function chapterTemplate({title, body}) {
  return `${title}
-------

${PortableText(body, {serializers})}

`
}
function generateSectionFileName(name, i) {
  return `Section ${i + 1} -- ${name}`
}
async function generateDocs() {
  const query = groq`*[_type == "specification"]|order(sortOrder)`
  const docs = await client.fetch(query).catch(console.error)
  const [GROQ, ...chapters] = docs

  const toc = chapters.map(({title}, i) => {
    return `# [${title}](${encodeURI(generateSectionFileName(title, i))}.md)\n\n`
  }).join('')
  await writeMDFile('GROQ', chapterTemplate(GROQ) + toc)
  await Promise.all(chapters.map(({title, body}, i) => {
    const md = chapterTemplate({title, body})
    const filename = generateSectionFileName(title, i)
    return writeMDFile(filename, md)
  }))
  const html = await specMarkdown.html(`./spec/GROQ.md`).catch(console.error)
  await writeFile('./docs/index.html', html).catch(console.error)
}


generateDocs().then(() => console.log('Generated docs'))
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== "prod") {
  console.log('Listening for changes')
  client
    .listen(groq`*[_type == "specification"]`)
    .subscribe(update => {
      generateDocs().then(() => console.log('Regenerated docs'))
    })
}
