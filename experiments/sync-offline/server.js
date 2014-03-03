#!/usr/bin/env node

var WebSocketServer = require('ws').Server;
var jsonPatch = require('../../lib/jsonPatch');

// Simple express just to server static demo files
var express = require('express');
var app = express();
app.configure(function () {
	var cwd = process.cwd();
	console.log(cwd);
	app.use(express.static(cwd));
	app.use(express.directory(cwd));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.listen(8000);

// The real fun: Setup DS WebSocket server
var data = {};
var localVersion = 0;

var clientId = 1;
var clients = {};

var running = false;
var server = new WebSocketServer({port: 8080});

server.on('connection', function(ws) {

	var id = clientId++;
	console.log('connected', id);

	var client = clients[id] = {
		id: id,
		ws: ws,
		version: localVersion,
		shadow: jsonPatch.snapshot(data)
	};

	send(ws, { data: data, localVersion: localVersion });

	ws.on('message', function(message) {
		var msg = JSON.parse(message);
		if(!msg.patches || msg.patches.length === 0) {
			console.log('no patch info');
			return;
		}

		process.nextTick(function() {
			msg.patches.forEach(function(change) {
				console.log(change);
				// Skip empty patches or patches referring to older versions
				if(!change.patch || change.patch.length === 0
					|| change.remoteVersion < localVersion) {
					return;
				}

				client.shadow = jsonPatch.patch(change.patch, client.shadow);
				client.version = change.localVersion;

				data = jsonPatch.patch(change.patch, data);
			});

			localVersion += 1;
			console.log(localVersion, data);

			respondWithPatch(client, data, localVersion);
			responseToOthersWithPatch(id, clients, data, localVersion);

		});
	});

	ws.on('close', function() {
		console.log('disconnected', id);
		delete clients[id];
	});
});

function respondWithPatch(client, data, version) {
	var returnPatch = jsonPatch.diff(client.shadow, data);
	send(client.ws, { patches: [{
		patch: returnPatch,
		localVersion: version,
		remoteVersion: client.version
	}]});
}

function responseToOthersWithPatch(skipId, clients, data, version) {
	Object.keys(clients).forEach(function(clientId) {
		if(clientId != skipId) {
			respondWithPatch(clients[clientId], data, version);
		}
	});
}

function send(ws, data) {
	ws.send(JSON.stringify(data));
}
