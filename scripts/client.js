const sanityClient = require('@sanity/client')

const token = process.env.SANITY_TOKEN

if (!token) {
  console.log('ERR: SANITY_TOKEN is required.')
  console.log('ERR: Run `sanity debug --secrets` to retrive it.')
  process.exit(1)
}

module.exports = sanityClient({
  projectId: '3do82whm',
  dataset: 'next',
  useCdn: false,
  token,
})
