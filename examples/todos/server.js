//
// Simple REST server for the init-rest client
//
// Run it from the root cola dir:
// `node examples/todos/server.js`
//
// It will create a flat file called todos.json for storing todos, and
// start a static web server on port 8080.  Point your browser at:
// `http://localhost:8080/examples/todos/`
//

var express = require('express');
var app = express();

var when = require('when');
var nodefn = require('when/node/function');
var mediate = require('../../mediate');
var ArrayMetadata = require('../../data/metadata/ArrayMetadata');
var ObjectMetadata = require('../../data/metadata/ObjectMetadata');
var observe = require('../../data/transaction/observe');
var transaction = require('../../data/transaction');
var queue = require('../../lib/queue');
var fs = require('fs');

var readFile = nodefn.lift(fs.readFile);
var writeFile = nodefn.lift(fs.writeFile);
var mediator;
var timeout;

var observer = { set: console.log, update: doSync };
var datasource = observe(observer, transaction(queue(), jsonArrayFileStore('./todos.json')));

var controller = {
	list: function(todos) {
		return todos;
	},

	create: function(todos, todo) {
		todos.push(todo);
	},

	patch: function(todos, patch, id) {
		todos.some(function(t) {
			if(t.id === id) {

				Object.keys(patch).reduce(function(todo, key) {
					todo[key] = patch[key];
					return todo;
				}, t);

				return true;
			}
		});
	},

	update: function(todos, todo, id) {
		todos.some(function(t, i, todos) {
			if(t.id === id) {
				todos[i] = todo;
				return true;
			}
		});
	},

	remove: function(todos, id) {
		todos.some(function(t, i, todos) {
			if(t.id === id) {
				todos.splice(i, 1);
				console.log('REMOVED', i, id, t, todos);
				return true;
			}
		});
	}
};

// Server still uses mediate() because I haven't had time to update it
// It works just fine, tho.
mediator = mediate(datasource, controller, observer);
mediator.refresh();

app.configure(function () {
	// used to parse JSON object given in the body request
	app.use(express.bodyParser());
	app.use(express.static(process.cwd()));
	app.use(express.directory(process.cwd()));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

makeJsonRestEndpoint(app, '/todos', controller);

app.listen(8080);

function makeJsonRestEndpoint(app, baseUrl, handler) {
	app.get(baseUrl, function (request, response) {
		handler.list().then(function(data) {
			console.log('list', data);
			response.json(data);
		}).otherwise(error)
	});

	app.post(baseUrl, function (request, response) {
		controller.create(request.body).then(function() {
			response.send(200);
		}).otherwise(error);
	});

	app.patch(baseUrl + '/:id', function(request, response) {
		console.log('patch', request.body);
		controller.patch(request.body, request.params.id).then(function() {
			response.send(200);
		}).otherwise(error)
	});

	app.put(baseUrl + '/:id', function(request, response) {
		console.log('update', request.body);
		controller.update(request.body, request.params.id).then(function() {
			response.send(200);
		}).otherwise(error)
	});

	app.delete(baseUrl + '/:id', function (request, response) {
		controller.remove(request.params.id).then(function() {
			response.send(200);
		}).otherwise(error);
	});

	function error(e) {
		response.send(400, e.stack);
	}

	return app;
}

function jsonArrayFileStore(file) {
	var array, metadata;

	metadata = new ArrayMetadata(new ObjectMetadata());

	return {
		metadata: metadata,

		fetch: function() {
			console.log('REFETCH');
			if(!array) {
				array = readFile(file)
					.then(JSON.parse)
					.otherwise(generateData);
			}

			return array;
		},

		update: function(changes) {
			console.log('CHANGES', changes);
			return when(array, function(a) {
				array = metadata.patch(a, changes);
				var json = JSON.stringify(array);
				console.log('syncing todos', json);
				return writeFile(file, json);
			}).otherwise(console.error);
		}
	};
}

function generateData() {
	var todos = [];
//	for(var i = 1; i<=10000; i++) {
//		todos.push({
//			id: String(i),
//			description: 'todo ' + i
//		});
//	}
//
	return todos;
}

function doSync() {}

