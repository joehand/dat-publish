require('leaked-handles')
var path = require('path')
var test = require('tape')
var spawn = require('tape-spawn')
var rimraf = require('rimraf')
var request = require('request')
var DatPush = require('dat-push')

var publish = path.resolve(path.join(__dirname, '..', 'cli.js'))
var publishDir = path.join(__dirname, 'tmpDats')
var pushDir = path.join(__dirname, 'fixtures')
var datPush = DatPush({dir: pushDir})

test('basic http', function (t) {
  var port = 8080
  var serverKey = 'test-server'
  var st = spawn(t, publish + ` ${serverKey} ${publishDir} --port=${port}`)
  st.stderr.empty()
  st.stdout.match(function (output) {
    if (output.indexOf('dat-archiver') === -1) return false
    run()
    return true
  })

  function run () {
    pushFixtures(serverKey, function () {
      var archiveKey = datPush.dat.archive.key.toString('hex')
      request(`http://localhost:${port}/${archiveKey}`, function (err, res, body) {
        t.error(err, 'request okay')
        if (res.statusCode !== 200) t.fail('bad http status')
        t.ok(body.indexOf('index.html') > -1, 'index.html in metadata')
        t.ok(body.indexOf('readme.md') > -1, 'readme.md in metadata')
        rimraf.sync(publishDir)
        st.kill()
        st.end()
      })
    })
  }
})

test('next one', function (t) {
  console.log('here')
  datPush.dat.close()
  t.end()
})

function pushFixtures (key, cb) {
  console.log('push started')
  datPush.push(key, function (err) {
    console.log('push done')
    if (err) console.error(err)
    cb()
  })
}
