define(function() {
	var id = 1;

	function Controller() {}

	Controller.prototype = {

		createTodo: function(todo) {
			todo.id = '' + Date.now() + id++;
			this.model.push(todo);
		},
		removeTodo: function(todo) {
			this.model.some(function(t, i, todos) {
				if(t.id === todo.id) {
					todos.splice(i, 1);
					return true;
				}
			});
		},
		removeAll: function() {
			this.model = [];
		}
	};

	return Controller;
});