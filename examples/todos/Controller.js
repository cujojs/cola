define('Controller', function() {
	var id = 1;

	function Controller() {
		this.model = [];
	}

	Controller.prototype = {
		init: function(todos) {
			this.todos = todos;
		},

		createTodo: function(e) {
			this.todos.push({
				id: '' + Date.now() + id++,
				description: e.target.elements.description.value
			});
		},
		removeTodo: function(todo) {
			this.todos.some(function(t, i, todos) {
				if(t.id === todo.id) {
					todos.splice(i, 1);
					return true;
				}
			});
		}
	};

	return Controller;
});