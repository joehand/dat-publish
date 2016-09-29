var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var Archiver = require('dat-archiver')
var hyperdriveHttp = require('hyperdrive-http')
var Dat = require('dat-js')
var level = require('level-party')

module.exports = function (opts) {
  if (!opts) opts = {}
  var datsDir = opts.dir || path.join(process.cwd(), 'dats')
  var discovery = opts.discovery || false
  if (!discovery.upload && !discovery.download) discovery = false
  var shareHttp = opts.http || true
  var rootArchive = opts.rootArchive || false
  opts.index = opts.index && typeof opts.index !== 'string' ? 'index.html' : opts.index
  var indexPage = rootArchive && opts.index ? opts.index : false
  var openDats = {}

  if (rootArchive && typeof rootArchive !== 'string') {
    // check if we have mulitple folders
    try {
      var dats = fs.readdirSync(datsDir)
      var count = 0
      dats.forEach(function (dat) {
        if (fs.statSync(path.join(datsDir, dat)).isDirectory()) {
          count++
          if (count > 1) throw new Error('More than one dat found. Specify key for root archive mode.')
          rootArchive = dat
        }
      })
    } catch (_) {
      // no dats yet, set archive key later
    }
  }

  var archiver = Archiver({dir: datsDir, getArchive: function (key, cb) {
    getArchive({key: key, type: 'archiver'}, cb)
  }})
  var onrequest = hyperdriveHttp(function (datInfo, cb) {
    if (!rootArchive && !datInfo.key) return cb(new Error('Not found'))
    if (rootArchive && !datInfo.key) datInfo.key = rootArchive
    if (rootArchive && indexPage) {
      if (!datInfo.filename) datInfo.filename = indexPage
      else if (datInfo.filename === 'metadata.json') datInfo.filename = null
    }
    getArchive({key: datInfo.key, type: 'http'}, cb)
  })

  archiver.on('connection', function () {
    console.log('New push connection.')
  })

  archiver.on('key-received', function (key) {
    console.log('Push started. Key:', key)
  })

  archiver.on('archive-finished', function (key) {
    console.log('Finished receiving push. Key:', key)
    if (discovery) openDats[key]._joinSwarm() // TODO: I guess this makes sense?
    else openDats[key].db.close()
  })

  archiver.on('error', function (err) {
    console.error(err)
  })

  return {
    archiver: archiver,
    httpRequest: shareHttp ? onrequest : undefined
  }

  function getArchive (opts, cb) {
    var key = opts.key
    var type = opts.type
    if (typeof key !== 'string') key = key.toString('hex')

    var dir = path.join(datsDir, key)
    try {
      if (!fs.statSync(dir).isDirectory() && type === 'http') return cb(new Error('No Archive found for http', key))
    } catch (e) { if (type === 'http') return cb(new Error('No Archive found for http', key)) }
    if (type === 'archiver') mkdirp.sync(dir)

    var dat = openDats[key]
    if (dat) return done()

    dat = Dat({
      dir: dir,
      key: key,
      db: level(path.join(dir, '.dat')),
      discovery: discovery,
      webrtc: opts.webrtc
    })
    dat.open(function (err) {
      if (err) return cb(err)
      openDats[key] = dat
      if (rootArchive && typeof rootArchive !== 'string') rootArchive = key
      done()
    })

    function done () {
      cb(null, dat.archive)
    }
  }
}
