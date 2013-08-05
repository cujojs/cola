/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var NodeCollection = require('./lib/NodeCollection');
	var proxy = require('./proxy/native');

	/**
	 * Binds a dom node to data.
	 * @param {HTMLElement} root
	 * @param {Object} options @see {NodeCollection}
	 * @return {Object} with a push(updates) function and a pull() function.
	 */
	function array (root, options) {

		options = Object.create(options || null);

		if (!options.identify) {
			options.identify = createIdentifyForProperty(options.id || 'id');
		}
		if (!options.proxy) {
			options.proxy = proxy({ missing: function () { return ''; } });
		}
		if (!options.compare) {
			options.compare = createCompareForProperty(options.sortBy || 'id',
				options.proxy);
		}

		var rdom = new NodeCollection(root, options);

		// TODO: support path property on change objects
		// TODO: also support changes property to compare to path
		// Note: array.splice(n, ...) causes array.length-n+1 change records!


		return {
			update: function (changes) {
				// changes is an array of objects: { type, object, name [, oldValue] }
				// type can be "new", "deleted", "updated", or "reconfigured"
				changes.forEach(function (change) {
					var model;

					if ('deleted' == change.type) {
						rdom.deleteModel(change.oldValue);
					}
					else {
						model = change.object[change.name];

						if (typeof model != 'object') {
							// skip 'length' property, etc.
						}
						else if ('new' == change.type) {
							rdom.insertModel(model);
						}
						else if ('updated' == change.type) {
							rdom.updateModel(model, change.oldValue);
						}
					}

				}, this);
			},
			set: function (all) {
				return rdom.setCollection(all);
			},
			find: function (nodeOrEvent) {
				return rdom.findModel(nodeOrEvent);
			},
			findNode: function (nodeOrEvent) {
				return rdom.findNode(nodeOrEvent);
			},
			clear: function () {
				return rdom.clearModel();
			}
		};
	}

	return array;

	function createIdentifyForProperty (prop) {
		return function (obj) { return Object(obj)[prop]; };
	}

	function createCompareForProperty (prop, proxy) {
		return function (a, b) {
			return compare(proxy.get(Object(a), prop), proxy.get(Object(b), prop));
		};
	}

	function compare (a, b) {
		return a < b ? -1 : a > b ? 1 : 0;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
