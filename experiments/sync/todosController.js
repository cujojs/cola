var id = 0;

module.exports = {
	add: function(todos, todo) {
		todo.id = ++id;
		todos.push(todo);
	},

	remove: function(todos, todo) {
		todos.splice(todos.indexOf(todo), 1);
	},

	completeAll: function(todos) {
		todos.forEach(function(todo) {
			todo.complete = true;
		});
	},

	removeCompleted: function(todos) {
		return todos.filter(function(todo) {
			return !todo.complete;
		});
	},

	generate: function(todos, data) {
		var n;
		try {
			n = parseInt(data.n, 10);
		} catch(e) {}
		return todos.concat(generateTodos(isNaN(n) ? 200 : n));
	},

	multiple: function(todos) {
		return todos
			.concat(generateTodos(todos.length).map(function(todo) {
				todo.description += ' just added';
				return todo;
			}))
			.reduce(function(todos, todo, i) {
				if(i % 2 !== 0) {
					todos.push(todo);
				}
				if(i % 3 === 0) {
					todo.complete = true;
				}
				if(i % 5 === 0) {
					todo.description += '!!!';
				}
				return todos;
			}, []);
	}
};


function generateTodos(n) {
	var todos = [];
	for(var i=0; i<n; i++) {
		++id;
		todos.push({
			id: id,
			description: 'todo ' + id,
			complete: false
		});
	}
	return todos;
}