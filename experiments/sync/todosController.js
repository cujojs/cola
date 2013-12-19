define(function() {

	return {
		add: function(todos, e) {
			todos.push({
				description: e.target.elements.description.value
			});
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
});