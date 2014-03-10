var jsonPatch = require('cola/lib/jsonPatch');
var when = require('when');

module.exports = Client;

function Client(url) {
	this._url = url;
	this._shadow = void 0;
	this._localVersion = -1;
	this._remoteVersion = -1;
	this._socket = void 0;
	this.data = void 0;

	this._buffer = [];
}

Client.prototype.initFromRemote = function() {
	return this._connect().then(this._requestData.bind(this));
};

Client.prototype.init = function(data, status) {
	var buffer = status.changes ? status.changes.slice() : [];
	this._init(data, status.localVersion, status.remoteVersion, buffer);

	return this.reconnect().yield(data);
};

Client.prototype.reconnect = function() {
	return this._connect()
		.then(this._requestStatus.bind(this))
		.then(this._sendChanges.bind(this));
};

Client.prototype._connect = function() {
	var socket = this._socket = new WebSocket(this._url);
	return when.promise(function(resolve) {
		socket.addEventListener('open', resolve);
	});
};

Client.prototype._requestData = function() {
	this._send({ data: 1 });
	return this._listen();
};

Client.prototype._requestStatus = function() {
	this._send({ status: 1 });
	return this._listen();
};

Client.prototype._listen = function() {
	var self = this;
	var socket = this._socket;
	return when.promise(function(resolve) {
		socket.addEventListener('message', function(msg) {
			self._messageHandler(JSON.parse(msg.data));

			if(typeof resolve === 'function') {
				resolve(self.data);
				resolve = void 0;
			}
		});
	});
};

Client.prototype._messageHandler = function(msg) {
	if(this.data === void 0 && msg.data) {
		this._initFromRemote(msg);
	} else if('localVersion' in msg) {
		this._remoteVersion = msg.localVersion;
	} else if(msg.patches) {
		this._patchFromRemote(msg);
	}
};

Client.prototype.sendChanges = function() {
	var changes = this._changes();

	if(!changes) {
		return;
	}

	this._localVersion += 1;
	this._buffer.push(changes);

	return this._sendChanges();
};

Client.prototype._sendChanges = function() {
	if(this._buffer.length > 0) {
		return this._send({ patches: this._buffer });
	}
}

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

	return changes;
};

Client.prototype.status = function() {
	return {
		changes: this._buffer.slice(),
		localVersion: this._localVersion,
		remoteVersion: this._remoteVersion
	};
};

Client.prototype._initFromRemote = function(msg) {
	this._init(msg.data, msg.localVersion, msg.localVersion, []);
};

Client.prototype._init = function(data, localVersion, remoteVersion, buffer) {
	this._localVersion = localVersion;
	this._remoteVersion = remoteVersion;
	this._buffer = buffer;
	this._shadow = jsonPatch.snapshot(data);
	this.data = data;
};

Client.prototype._pruneChanges = function() {
	// Remove patches the server has acknowledged
	// IOW keep only patches that have a higher remoteVersion
	// than the version the server just told us it has.
	var remoteVersion = this._remoteVersion;
	this._buffer = this._buffer.filter(function (change) {
		return change.remoteVersion > remoteVersion;
	});
}

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

	this._pruneChanges();
	this.onRemoteChange(this);
};

Client.prototype._send = function(data) {
	if(this._socket.readyState === 1) {
		this._socket.send(JSON.stringify(data));
		return true;
	}

	this.reconnect();
	return false;
};
