define(function() {

	function Controller() {}

	Controller.prototype = {
		generateName: function(data) {
//			document.querySelector('[name="name"]').value = Math.random();
			data.name = '' + Math.random();
		}
	};

	return Controller;

});