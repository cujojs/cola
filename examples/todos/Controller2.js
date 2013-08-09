define(function() {
	var id = 1;

	function Controller() {}

	Controller.prototype = {

		create: function(todos, todo) {
			todo.id = '' + Date.now() + id++;
			todos.push(todo);
		},

		remove: function(todos, todo) {
			todos.some(function(t, i, todos) {
				if(t.id === todo.id) {
					todos.splice(i, 1);
					return true;
				}
			});
		},

		update: function(todos, todo) {
			todos.some(function(t) {
				if(t.id === todo.id) {
					console.log(t, todo);
					t.completed = !t.completed;
					console.log(t, todo);
					return true;
				}
			});
		},

		completeAll: function(todos) {
			return todos.map(function(todo) {
				todo.completed = true;
				return todo;
			});
		},

		removeCompleted: function(todos) {
			return todos.filter(function(todo) {
				return !todo.completed;
			});
		}
	};

	return Controller;
});