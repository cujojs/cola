define(function() {
	function Controller() {}

	Controller.prototype = {

		create: function(todos, todo) {
//			todos.add(todo);
			// Or
			return todos.create(todo);
		},
		remove: function(todos, todo) {
//			todos.remove(todo);
			// Or
			todo = todos.get(todo);
			return todo && todo.destroy();
		},

		update: function(todos, todo) {
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