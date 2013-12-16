define(function() {

	return {
		add: function(things, e) {
			e.preventDefault();

			var key = e.target.elements.key.value;
			if(!key) {
				return;
			}

			things[key] = { key: key, value: e.target.elements.value.value };

			e.target.reset();
		}
	};

});