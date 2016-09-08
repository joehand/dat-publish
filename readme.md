# Dat Publish

Publish your dats to HTTP and run a public Dat peer!

Uses [hyperdrive-http](https://github.com/joehand/hyperdrive-http) and [dat-archiver](https://github.com/maxogden/dat-archiver) to be a publicly accessible archive for your data stored in Dat. Push new files to the server with [dat-push](https://github.com/joehand/dat-push).

### Serving Dat files over HTTP

* Run `dat-publish` on your server. It will print a `<server-key>` for dat-archiver.
* Create a dat on your local computer (or use an existing directory without a Dat).
* `dat-push <server-key> [directory]`. Push a dat/directory to your server with `<server-key>`.
* Your files will be available on your server over http!

### Public Dat Peer

You can also use dat-publish to act as a public dat peer.

Follow the same commands as above with the discovery option: `dat-publish <server-key> --discovery`. After a `dat-push` is run, dat-publish will share your files on Dat.

## Installation 

```
npm install -g dat-publish
```

## Usage

```
dat-publish <server-key> [directory] --port=1234 --discovery
```

* `<server-key>` is the key for the [peer-network] server. This is a private key for you to push files to with dat-push.
* `directory`: store the dat directories. Each dat will be stored in a folder with it's key as the name.
* `port`: Port for http server
* `discovery`: Public Dat peer. Join Dat swarm after a dat-push is finished.

### Single Archive Options

You can choose a single archive to serve at the root. This allows you to do things like publish a static website. By default it will serve `index.html` at the root and the filelist at `metadata.json`.

If you have a single archive to publish, run:

* `dat-publish server-key --single-archive`

If you have multiple archives on your dat-archiver, you need to specify the archive key to serve as root:

* `dat-publish server-key --archive=<dat-link>`

To overwrite the index page, use the index option:

* `dat-publish server-key --single-archive --index=foo.html`

## API 

### `var publish = datPublish({opts})``

Options include: 

```js
{
  dir: process.cwd + '/dats', // directory to store dats received from dat-push
  discovery: false // join dat swarm after a completed dat-push
  archive: <key>, // dat archive key to serve as root of http
  index: 'index.html', // index page for single archive mode
}
```

### `publish.archiver`

dat-archiver instance. Use `publish.archiver.join(serverKey)` to join an archiver server.

### `publish.httpRequest`

hyperdrive-http request function, use this in a http server: `server.on('request', publish.httpRequest)`.

See `cli.js` for example usage.

## License

MIT