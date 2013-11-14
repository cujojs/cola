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
var fs = require('fs');

var readFile = nodefn.lift(fs.readFile);
var writeFile = nodefn.lift(fs.writeFile);

app.configure(function () {
	// used to parse JSON object given in the body request
	app.use(express.bodyParser());
	app.use(express.static(process.cwd()));
	app.use(express.directory(process.cwd()));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var todos = readFile('todos.json')
	.then(JSON.parse)
	.otherwise(generateData);

makeJsonRestEndpoint(app, '/todos');

app.listen(8080);

function withTodos(response, f) {
	return when(todos, function(todos) {
		return when(f(todos), function(result) {
			if(result) {
				response.json(result);
			} else {
				response.send(201);
			}
			return writeFile('todos.json', JSON.stringify(todos));
		});
	})
	.otherwise(function(e) {
		console.error(e.stack);
		response.status(e.status || 404).send(e.toString());
	});
}

function makeJsonRestEndpoint(app, baseUrl) {
	app.get(baseUrl, function (request, response) {
		withTodos(response, function(todos) {
			var arr = [];
			for(var id in todos) {
				arr.push(todos[id]);
			}
			return arr;
		});
	});

	app.post(baseUrl, function (request, response) {
		withTodos(response, function(todos) {
			var todo = request.body;
			todos[todo.id] = todo;
		})
	});

	app.patch(baseUrl, function(request, response) {
		withTodos(response, function(todos) {
			var patches = request.body;
			patches.forEach(function(patch) {
//				console.log(patch.op, patch.path);
				if(patch.op === 'add') {
					todos[patch.path] = patch.value;
				} else if(patch.op === 'replace') {
					if(patch.path in todos) {
						todos[patch.path] = patch.value;
					}
				} else if(patch.op === 'remove') {
					delete todos[patch.path];
				}
			});
		});
	})

	app.patch(baseUrl + '/:id', function(request, response) {
		withTodos(response, function(todos) {
			var patch = request.body;
			var todo = todos[request.params.id];
			if(!todo) {
				throw new Error('Not found');
			} else {
				for(var p in patch) {
					todo[p] = patch[p];
				}
			}
		});
	});

	app.put(baseUrl + '/:id', function(request, response) {
		withTodos(response, function(todos) {
			var update = request.body;
			var todo = todos[request.params.id];
			if(todo) {
				todos[request.param.id] = update;
			}
		});
	});

	app.delete(baseUrl + '/:id', function (request, response) {
		withTodos(response, function(todos) {
			delete todos[request.params.id];
		});
	});

	return app;
}

function generateData() {
	var todos = {};
	for(var i = 1; i<=10000; i++) {
		todos[i] = {
			created: Date.now(),
			id: String(i),
			description: 'todo ' + i
		};
	}

	return todos;
}
