/* eslint-disable no-undef, @typescript-eslint/no-var-requires */
const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 4000

const publicFolderFiles = ['index.html', 'bundle.js']
  .map(fileName => path.join(`${__dirname}/../public/${fileName}`))
const assetFolderFiles = ['character.json', 'tiles.json', 'house.json', 'character.png', 'tiles.png', 'house.png']
  .map(fileName => path.join(`${__dirname}/../assets/${fileName}`))

// eslint-disable-next-line no-useless-call
const ALLOWED_PATHS = [].concat.apply([], [publicFolderFiles, assetFolderFiles])

http.createServer((req, res) => {
  const requestUrl = url.parse(req.url)
  const reqPath = path.normalize(requestUrl.pathname)
  // eslint-disable-next-line no-console
  console.log('HTTP GET', req.headers.referer)
  const fsPublicPath = path.join(`${__dirname}/../public/${reqPath === '/' ? 'index.html' : reqPath}`)
  const fsAssetsPath = path.join(`${__dirname}/../${reqPath}`)
  try {
    const isPublic = ALLOWED_PATHS.includes(fsPublicPath)
    const isAsset = ALLOWED_PATHS.includes(fsAssetsPath)
    if (isPublic || isAsset) {
      const fileStream = fs.createReadStream(isPublic ? fsPublicPath : fsAssetsPath)
      fileStream.pipe(res)
      fileStream.on('open', () => {
        res.writeHead(200)
      })
      fileStream.on('error', err => {
        // eslint-disable-next-line no-console
        console.error(`Error while writing response ${requestUrl.pathname}`, err)
        res.writeHead(404)
        res.end()
      })
      fileStream.on('end', () => {
        res.end()
      })
    } else {
      res.writeHead(400)
      res.end()
    }
  } catch (err) {
    res.writeHead(500)
    res.end()
    // eslint-disable-next-line no-console
    console.error(`Error while GET ${requestUrl.pathname}`, err)
  }
}).listen(PORT)
