module.exports = {
	add: function(todos, todo) {
		todos.push(todo);
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
	}
};
