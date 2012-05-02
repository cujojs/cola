(function (define) {
define(function (require) {

	var when = require('when'),
		itemChangeEvents = { add: 1, update: 1 };

	/**
	 * Creates a strategy function that re-broadcasts item changes as "update"
	 * events after an "update" or "add".
	 * @param options {Object} not currently used
	 * @return {Function} a network strategy function
	 */
	return function (options) {

		return function updateAfterItemChange (source, dest, data, type, api) {
			if (api.isPropagating() && source != dest && eventCouldChangeItem(dest, type)) {
				when(dest[type](data), function (updated) {
					// only re-broadcast if we received an object that has
					// properties.
					if (hasProperties(updated)) {
						api.queueEvent(dest, updated, 'update');
					}
				});
				return false; // stop base strategy from firing, too.
			}
		};

	};

	function eventCouldChangeItem (dest, type) {
		return type in itemChangeEvents && typeof dest[type] == 'function'
	}

	function hasProperties (o) {
		if (!o) return false;
		for (var p in o) return true;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));