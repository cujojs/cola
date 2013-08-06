define(function() {
	function Controller() {}

	Controller.prototype = {

		createTodo: function(todos, todo) {
//			todos.add(todo);
			// Or
			return todos.create(todo);
		},
		removeTodo: function(todos, todo) {
//			todos.remove(todo);
			// Or
			todo = todos.get(todo);
			return todo && todo.destroy();
		},

		updateTodo: function(todos, todo) {
			todo = todos.get(todo);
			todo.save({ completed: !todo.get('completed') });
		},

		completeAll: function(todos) {
			todos.forEach(function(todo) {
				todo.save({ completed: true})
			});
		},

		removeCompleted: function(todos) {
			todos.filter(function(todo) {
				return todo.get('completed');
			}).forEach(function(todo) {
				todo.destroy();
			});
		}
	};

	return Controller;
});