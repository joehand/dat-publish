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
dat-publish [<server-key>] [directory]
```

* Set `<server-key>` to *name* your sever. When using dat-push, you will push to this key. If you do not set a name, a 16 character key will be generated for you. Anyone with the key will be able to push to your server.
* `directory`: store the dat directories. Each dat will be stored in a folder with it's key as the name.

### CLI Options

* `--http`, `-h`: Share archive(s) via hyperdrive-http over port.
* `--dat-upload`, `-u`: Share via Dat peer. Join Dat swarm after a dat-push is finished, will only **upload** data, not download new data.
* `--dat-download`, `-d`: Update dat from live source (dat share on your computer will update the server).
* `--root=<archive-key>`, `-r`: Archive key to serve as root archive.
* `--index=file.html`, `-i`: Page to serve as index for archive(s). If not set, metadata will be served at root.
* `--port=1234`: Port for http server

### Root Archive Options

You can choose a single archive to serve at the root. This allows you to do things like publish a static website. By default it will serve `index.html` at the root and the filelist at `metadata.json`.

If you have a root archive to publish, run:

* `dat-publish my-server-name --root`

If you have multiple archives on your dat-archiver, you need to specify the archive key to serve as root:

* `dat-publish my-server-name --root=<dat-link>`

### Index Page

To show `index.html` as the index page for all archives, use the `--index` option:

* `dat-publish my-server-name --root --index`

To overwrite the index page for all archives, set the index to the page name:

* `dat-publish my-server-name --root --index=foo.html`

## API 

### `var publish = datPublish({opts})``

Options include: 

```js
{
  dir: process.cwd + '/dats', // directory to store dats received from dat-push
  discovery: { // join dat swarm after a completed dat-push
    upload: false, // Upload data to other peers
    download: false // Download live updates from archive source
  }
  rootArchive: <key>, // dat archive key to serve as root of http
  index: 'index.html', // index page for root archive mode
  http: true // return onRequest function for http usage
}
```

### `publish.archiver`

dat-archiver instance. Use `publish.archiver.join(serverKey)` to join an archiver server.

### `publish.httpRequest`

hyperdrive-http request function, use this in a http server: `server.on('request', publish.httpRequest)`.

See `cli.js` for example usage.

## License

MIT