define(function(require) {

	var when, enqueue;

	when = require('when');
	enqueue = require('../enqueue');

	return function filteredAdapter(adapter) {

		var filtered, matchFilter, callOrig;

		callOrig = true;
		matchFilter = alwaysInclude;

		filtered = Object.create(adapter);

		filtered.add = function(item, callOrig) {
			if(callOrig === false) return;

			adapter.add(item, callOrig);

			return matchFilter(item) ? item : null;
		};

		filtered.update = function(item) {
			var p = adapter.update(item);

			if (!matchFilter(item)) {
				return when(p, function() {
					callOrig = false;
					return when(filtered.remove(item, false), function () {
						enqueue(function () {
							callOrig = true;
						});
					});
				});
			}
		};

		filtered.remove = function(item, callOrig) {
			if(callOrig === false) return;

			return adapter.remove(item, callOrig);
		};

		filtered.filter = function(query) {
			if(typeof query == 'function') {
				matchFilter = query;

			} else {
				if(!query) query = {};

				var queryKeys = Object.keys(query);

				matchFilter = queryKeys.length == 0
					? alwaysInclude
					: function(item) {
					return queryKeys.every(function(key) {
						return key in item && query[key] == item[key];
					});
				};
			}

			callOrig = false;
			when(adapter.forEach(function(item) {
				var p = matchFilter(item) ? filtered.add(item, false) : filtered.remove(item, false);

				return when(p, function (item) {
					enqueue(function () {
						callOrig = true;
					});
				});
			}));
		};

		return filtered;

	};

	function alwaysInclude() {
		return true;
	}

});