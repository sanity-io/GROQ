const client = require('./client')
const groq = require('groq')
const cp = require('child_process')
const {debounce} = require('lodash')

const [command, ...args] = process.argv.slice(2)

const rebuild = debounce(() => {
  console.log(`Running: ${command} ${args.join(' ')}`)
  cp.spawn(command, args, {stdio: ['inherit', 'inherit', 'inherit']})
}, 100)

console.log('Listening for changes')
client.listen(groq`*[_type == "specification"]`).subscribe((update) => {
  rebuild()
})
