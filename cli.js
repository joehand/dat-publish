#!/usr/bin/env node
var http = require('http')
var crypto = require('crypto')
var datPublish = require('.')

var args = require('minimist')(process.argv.splice(2), {
  alias: {
    d: 'dat', // dat discovery + upload
    u: 'update-dat', // dat discovery + download (updates archive via dat)
    h: 'http',
    r: 'root',
    i: 'index'
  },
  boolean: ['dat', 'update-dat', 'http'],
  default: {
    port: 8080,
    http: true
  }
})

var server = http.createServer()
var publish = datPublish({
  dir: args._[1],
  http: args.http,
  discovery: {
    upload: args.dat,
    download: args['update-dat']
  },
  rootArchive: args.root,
  index: args.index
})

var key = args._[0] || crypto.randomBytes(16).toString('hex')
publish.archiver.join(key)
console.log(`dat-archiver listening on ${key}`)

if (args.http) {
  server.listen(args.port)
  server.once('error', function () {
    server.listen(0)
  })
  server.on('request', publish.httpRequest)
  console.log(`hyperdrive-http listening on ${args.port}`)
}
