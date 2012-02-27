/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

	"use strict";

	var ArrayAdapter, when, undef;

	ArrayAdapter = require('./ArrayAdapter');
	when = require('when');

	/**
	 * Manages a collection of objects taken from the resolution of the
	 * supplied resultSet, since resultSet may be a promise.
	 * @constructor
	 * @param resultSet {Array|Promise} array of data objects, or a promise for
	 * an array of data objects
	 * @param options.keyFunc {Function} function that returns a key/id for
	 * a data item.
	 * @param options.comparator {Function} comparator function that will
	 * be propagated to other adapters as needed
	 */
	function ResultSetAdapter(resultSet, options) {

		var self, init;

		this._resultSetPromise = resultSet;

		self = this;
		init = ArrayAdapter.prototype._init;

		ArrayAdapter.call(self, [], options);

		when(resultSet, function(results) {
			init.call(self, results);
		});
	}

	ResultSetAdapter.prototype = {

		/**
		 * ResultSetAdapter needs to delay running ArrayAdapter._init, so provides
		 * it's own noop _init which ArrayAdapter() will call immediately, and
		 * ResultSetAdapter() above will call ArrayAdapter._init at the appropriate
		 * time.
		 */
		_init: function() {},

		comparator: undef,

		symbolizer: undef,

		// just stubs for now
		getOptions: ArrayAdapter.prototype.getOptions,

		watch: makePromiseAware(ArrayAdapter.prototype.watch),

		forEach: makePromiseAware(ArrayAdapter.prototype.forEach),

		add: makePromiseAware(ArrayAdapter.prototype.add),

		remove: makePromiseAware(ArrayAdapter.prototype.remove)
	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is a promise or
	 * ArrayAdapter.canHandle returns true;
	 *
	 * WARNING: Testing for a promise is NOT sufficient, since the promise
	 * may result to something that this adapter cannot handle.
	 *
	 * @param it
	 * @return {Boolean}
	 */
	ResultSetAdapter.canHandle = function(it) {
		return when.isPromise(it) || ArrayAdapter.canHandle(it);
	};

	/**
	 * Returns a new function that will delay execution of the supplied
	 * function until this._resultSetPromise has resolved.
	 *
	 * @param func {Function} original function
	 * @return {Promise}
	 */
	function makePromiseAware(func) {
		return function() {
			var self, args;

			self = this;
			args = Array.prototype.slice.call(arguments);

			return when(this._resultSetPromise, function() {
				return func.apply(self, args);
			});
		}
	}

	return ResultSetAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
