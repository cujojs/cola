#!/usr/bin/env node

var express = require('express');
var jsonPatch = require('./lib/jsonPatch');

var app = express();

var data = {
	person: { address: {} },
	todos: []
};

var shadow = jsonPatch.snapshot(data);

app.configure(function () {
	var cwd = process.cwd();
	console.log(cwd);
	// used to parse JSON object given in the body request
	app.use(express.bodyParser());
	app.use(express.static(cwd));
	app.use(express.directory(cwd));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

makeRestEndpoint(app, 'person');
makeRestEndpoint(app, 'todos');
makeJsonPatchEndpoint(app);

app.listen(8080);

function makeRestEndpoint(app, baseUrl) {
	app.get('/' + baseUrl, function(request, response) {
		response.json(data[baseUrl]);
	});
}

function makeJsonPatchEndpoint(app) {
	app.patch('/', function(request, response) {
		var patch = request.body;
		console.log(patch);
		jsonPatch.patch(patch, shadow);
		jsonPatch.patch(patch, data);

		console.log('Multi-patch done');
		response.json(jsonPatch.diff(shadow, data));
	});
}