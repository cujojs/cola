module.exports = {
	add: function(todos, todo) {
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
	}
};


function generateTodos(n) {
	var todos = [];
	for(var i=0; i<n; i++) {
		todos.push({
			description: 'todo ' + i,
			complete: false
		});
	}
	return todos;
}