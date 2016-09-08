#!/usr/bin/env node
var http = require('http')
var crypto = require('crypto')
var datPublish = require('.')

var args = require('minimist')(process.argv.splice(2), {
  alias: {d: 'discovery'},
  boolean: ['discovery'],
  default: {
    port: 8000
  }
})

var server = http.createServer()
var publish = datPublish({dir: args._[1], discovery: args.discovery})

var key = args._[0] || crypto.randomBytes(16).toString('hex')
publish.archiver.join(key)
server.listen(args.port)
server.once('error', function () {
  server.listen(0)
})
server.on('request', publish.httpRequest)

console.log(`dat-archiver listening on ${key}`)
console.log(`hyperdrive-http listening on ${args.port}`)
