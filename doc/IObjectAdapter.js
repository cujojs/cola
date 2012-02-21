/** MIT License (c) copyright B Cavalier & J Hann */

/**
 * Creates a cola adapter for interacting with a single object.
 * @constructor
 * @param object {Object}
 */
function IObjectAdapter (object) {}

IObjectAdapter.prototype = {

	/**
	 * Sets the binding info for this object.  We haven't determined
	 * whether derived values will be handled here or external to
	 * the adapter.  Some adapters need binding info to do their job.
	 * @param bindings
	 */
	setBindings: function (bindings) {},

	/**
	 * Watches a specific property and calls back when it changes.
	 * @param name {String} the name of the property to watch.
	 * @param callback {Function} function (propValue, propName) {}
	 * @returns {Function} a function to call when done watching.
	 */
	watch: function (name, callback) {},

	/**
	 * Watches all nodes that have explicit bindings.
	 * @param callback {Function} function (propValue, propName) {}
	 * @returns {Function} a function to call when done watching.
	 */
	watchAll: function (callback) {},

	/**
	 * Signals that a property in a synchronized object has changed.
	 * @param name {String} the name of the changed property
	 * @param value the value of the changed property
	 */
	set: function (name, value) {},

	/**
	 * Pushes data to the other adapter by calling set() for each
	 * property on this adapter's object.
	 * @param adapter {IObjectAdapter}
	 */
	syncTo: function (adapter) {}

};

/**
 * Tests whether the given object is a candidate to be handled by
 * this adapter.
 * @param obj
 * @returns {Boolean}
 */
IObjectAdapter.canHandle = function (obj) {};
