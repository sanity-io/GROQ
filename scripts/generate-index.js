const formatDate = require('date-fns/format')
const fs = require('fs')

function render(versions) {
  const rows = versions.map(({slug, name, date, variant}) => {
    return `<tr>
      <td>${variant ? `<em>${variant}</em>` : ''}</td>
      <td><a href="${slug}">${name}</a></td>
      <td>${formatDate(date, 'MMM d, yyyy')}</td>
    </tr>`
  })

  return `<html>
  <head>
    <title>GROQ Specification Versions</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        color: #333333;
        font: 13pt/18pt Cambria, 'Palatino Linotype', Palatino, 'Liberation Serif', serif;
        margin: 6rem auto 3rem;
        max-width: 780px;
      }
      @media (min-width: 1240px) {
        body {
          padding-right: 300px;
        }
      }
      a {
        color: #3B5998;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      h1 {
        font-size: 1.5em;
        margin: 8rem 0 2em;
      }
      td {
        padding-bottom: 5px;
      }
      td + td {
        padding-left: 2ch;
      }
    </style>
  </head>
  <body>
    <h1>GROQ</h1>
    <table>
      <tbody>${rows.join('')}</tbody>
    </table>
  </body>
  </html>`
}

async function main() {
  const versions = [{
    slug: "draft",
    name: "Working Draft",
    date: new Date(),
    variant: "Prerelease"
  }]

  const input = fs.readFileSync(0).toString().trim() 
  const lines = input.length > 0 ? input.split("\n") : []
  let isFirst = true;

  for (const line of lines) {
    const [version, date] = line.split(" ")
    versions.push({
      slug: version,
      name: version,
      date: Number(date) * 1000,
      variant: isFirst ? "Latest release" : "",
    })
    isFirst = false
  }

  console.log(render(versions))
}

main()