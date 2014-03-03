var jsonPatch = require('cola/lib/jsonPatch');
var when = require('when');

module.exports = Client;

function Client(url) {
	this._url = url;
	this._shadow = void 0;
	this._localVersion = 0;
	this._remoteVersion = 0;
	this._socket = void 0;

	this._buffer = [];

	var self = this;
	this.ready = when.promise(function(resolve) {
		self._connect(resolve);
	});
}

Client.prototype._connect = function(resolve) {
	var socket = this._socket = new WebSocket(this._url);
	var self = this;

	socket.addEventListener('message', function(msg) {
		msg = JSON.parse(msg.data);

		if(msg.data) {
			self.set(msg);

			if(typeof resolve === 'function') {
				resolve(msg.data);
				resolve = void 0;
			}
		} else if(msg.patches) {
			self._patchFromRemote(msg);
		}
	});
};

Client.prototype.sendChanges = function() {
	var changes = this._changes();

	if(!changes) {
		return;
	}

	this._buffer.push(changes);

	this._send({ patches: this._buffer });
};

Client.prototype._changes = function() {
	var patch = jsonPatch.diff(this._shadow, this.data);
	if(!patch || patch.length === 0) {
		return;
	}

	var changes = {
		patch: patch,
		localVersion: this._localVersion,
		remoteVersion: this._remoteVersion
	};

	this._shadow = jsonPatch.patch(jsonPatch.snapshot(changes.patch), this._shadow);
	this._localVersion += 1;

	return changes;
};

Client.prototype.set = function(doc) {
	this._localVersion = this._remoteVersion = doc.localVersion;
	this._shadow = jsonPatch.snapshot(doc.data);
	this.data = doc.data;
};

Client.prototype._patchFromRemote = function(remote) {
	remote.patches.forEach(function(change) {
		// Skip patches we receive but have already seen
		if(change.localVersion < this._remoteVersion) {
			console.log('skipping change', change);
			return;
		}

		this._shadow = jsonPatch.patch(change.patch, this._shadow);
		this._remoteVersion = change.localVersion;

		this.data = jsonPatch.patch(change.patch, this.data);
	}, this);

	// Remove patches the server has acknowledged
	// IOW keep only patches that have a higher remoteVersion
	// than the version the server just told us it has.
	var remoteVersion = this._remoteVersion;
	this._buffer = this._buffer.filter(function(change) {
		return remoteVersion > change.remoteVersion;
	});

	this.onRemoteChange(this.data);
};

Client.prototype._send = function(data) {
	this._socket.send(JSON.stringify(data));
};
