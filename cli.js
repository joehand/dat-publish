#!/usr/bin/env node
var http = require('http')
var crypto = require('crypto')
var datPublish = require('.')

var args = require('minimist')(process.argv.splice(2), {
  // alias: {
  //   d: 'dat-download', // dat discovery + download (updates archive via dat)
  //   u: 'dat-upload', // dat discovery + upload
  //   h: 'http'
  // },
  // boolean: ['dat-download', 'dat-upload', 'http']
})

var publish = datPublish()

var key = args._[0] || crypto.randomBytes(16).toString('hex')
publish.archiver.join(key)
console.log(`dat-archiver listening on ${key}`)
