var fs = require('fs')
var path = require('path')
var Archiver = require('dat-archiver')
var serveArchives = require('archiver-server')

module.exports = function (opts) {
  if (!opts) opts = {}
  var dir = opts.dir || path.join(process.cwd(), 'dats')

  var archiver = Archiver({dir: dir})

  serveArchives(archiver.archives, opts)

  return {
    archiver: archiver
  }
}
