/** MIT License (c) copyright B Cavalier & J Hann */

/**
 * Stores a watchable interface of collection. This is the interface
 * that all collection/list adapters must implement.
 *
 * @constructor
 *
 * @param collection {Object}
 */
function ICollectionAdapter (collection) {

}

ICollectionAdapter.prototype = {

	/**
	 * Compares two data items.  Works just like the comparator function
	 * for Array.prototype.sort.
	 * @memberOf ICollectionAdapter
	 *
	 * @param a {Object}
	 * @param b {Object}
	 *
	 * @returns {Number} -1, 0, 1
	 *
	 * @description This comparator is used for two purposes:
	 * 1. to sort the items in the list (sequence)
	 * 2. to find an item in the list (identity)
	 * This property is undefined by default and should be injected.
	 * If not supplied, the mediator will supply one from another source.
	 * If the comparator tests for identity, it must indicate this via
	 * a truthy "identity" property on the function. Example:
	 * function compareWidgets (w1, w2) {
	 *     if (w1.id == w2.id) return 0;
	 *     else return w1.id - w2.id;
	 * }
	 * compareWidgets.identity = true;
	 * myWidgetCollectionAdapter.comparator = compareWidgets;
	 */
	comparator: undefined,

	/**
	 * Uniquely names a data item. This isn't a key generator,
	 * it extracts a unique string representation from an object.
	 * @memberOf ICollectionAdapter
	 *
	 * @param object {Object}
	 *
	 * @returns {String}
	 */
	symbolizer: undefined,

	/**
	 * Indicates that a new item should be added to the collection.
	 * @memberOf ICollectionAdapter
	 *
	 * @param item {Object}
	 *
	 * @returns {Object} a new unadapted object, if one was created. The
	 * collection may not need to create a new object if it can consume
	 * adapted objects directly.
	 *
	 * @description After adding the item, this method fires an event
	 * to listeners.
	 */
	add: function (item) {},

	/**
	 * Indicates that an item in the collection should be removed.
	 * @memberOf ICollectionAdapter
	 *
	 * @param item {Object}
	 *
	 * @description This function will only work if the collection has a
	 * comparator function that can detect identity. A comparator that
	 * only sorts will not work. After adding the item, this method fires
	 * an event to listeners.
	 */
	remove: function (item) {},

	/**
	 * Stores callback functions for listening to add and remove calls.
	 * @memberOf ICollectionAdapter
	 *
	 * @param add {Function} function (item) {}
	 * @param remove {Function} function (item) {}
	 *
	 * @returns {Function} function () {} a function to call to stop
	 * listening.
	 *
	 * @description No checks for recursion are made in the callbacks.
	 * It is the job of a mediator to ensure that there are no cycles.
	 */
	watch: function (add, remove) {},

	/**
	 * Iterates over all of the items in the collection and runs the
	 * lambda functionfor each one.
	 * @param lambda {Function} function (item) { }
	 */
	forEach: function (lambda) {},

	/**
	 * Optional. Determines if the given item has changed sufficiently that
	 * it needs to be repositioned in the collection.
	 *
	 * @param item {Object}
	 */
	checkPosition: function (item) {},

	/**
	 * Optional method to get the options information that
	 * were provided to the adapter
	 * @returns {Object}
	 */
	getOptions: function () {

	}

};

/**
 * Tests an object to determine if it has an interface sufficient
 * for use with this adapter.
 * @memberOf ICollectionAdapter
 * @static
 *
 * @param object {Object}
 *
 * @returns {Boolean}
 */
ICollectionAdapter.canHandle = function (object) {};
