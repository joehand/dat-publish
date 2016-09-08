var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var Archiver = require('dat-archiver')
var hyperdriveHttp = require('hyperdrive-http')
var Dat = require('dat-js')
var level = require('level-party')

module.exports = function (opts, cb) {
  if (!opts) opts = {}
  var datsDir = opts.dir || path.join(process.cwd(), 'dats')
  var discovery = opts.discovery || false
  var openDbs = {}

  var archiver = Archiver({dir: datsDir, getArchive: function (key, cb) {
    getArchive({key: key, type: 'archiver'}, cb)
  }})
  var onrequest = hyperdriveHttp(function (datInfo, cb) {
    getArchive({key:datInfo.key, type: 'http'}, cb)
  })

  archiver.on('connection', function () {
    console.log('New push connection.')
  })

  archiver.on('key-received', function (key) {
    console.log('Push started. Key:', key)
  })

  archiver.on('archive-finished', function (key) {
    console.log('Finished receiving push. Key:', key)
  })

  return {
    archiver: archiver,
    httpRequest: onrequest
  }

  function getArchive (opts, cb) {
    var key = opts.key
    var type = opts.type
    if (typeof key !== 'string') key = key.toString('hex')

    var dir = path.join(datsDir, key)
    try {
      if (!fs.statSync(dir).isDirectory() && type === 'http') return console.error('No Archive found for http', key)
    } catch (e) { if (type === 'http') return console.error('No Archive found for http', key)}
    mkdirp.sync(dir)

    var db = openDbs[key] || level(path.join(dir, '.dat'))
    var dat = Dat({
      dir: dir,
      key: key,
      db: db,
      discovery: discovery
    })
    dat.open(function (err) {
      openDbs[key] = dat.db
      if (err) return cb(err)
      cb(null, dat.archive, function (err) {
        if (err) return cb(err)
        if (discovery) dat._joinSwarm() // TODO: I guess this makes sense?
        else dat.close()
      })
    })
  }
}
