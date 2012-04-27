(function (define) {
define(function () {

	var defaultCollectionProperty, isArray;

	defaultCollectionProperty = 'items';

	isArray = Array.isArray || function (o) {
		return Object.prototype.toString.call(o) == '[object Array]';
	};

	/**
	 *
	 * @param options
	 * @return {Function}
	 *
	 * @description
	 * Note: this strategy relies on select and unselect events carrying
	 * the data item with them. (This is the intended behavior, but devs
	 * have the option to send something else.)
	 */
	return function (options) {
		var collProp, collector, collection, index;

		if (!options) options = {};

		collProp = options.collectionProperty || defaultCollectionProperty;

		return function collectThenDeliver (source, dest, data, type, api) {

			// if we're currently collecting
			if (collector) {
				if (api.isBefore()) {
					// cancel if we get another "collect" event
					if ('collect' == type) {
						// TODO: how do we notify the system why we canceled?
						// queue an "error" event?
						return false;
					}
				}
				else if (api.isAfter()) {
					// watch for select
					if (type == 'select') {
						collect(data, source.identifier(data));
					}
					// also watch for unselect events and remove events
					else if (type == 'unselect' || type == 'remove') {
						uncollect(data, source.identifier(data));
					}
					// watch for "submit" events
					else if ('submit' == type) {
						api.queueEvent(source, collector, 'deliver');
						stopCollecting();
					}
					// watch for cancel events
					else if ('cancel' == type) {
						stopCollecting();
					}
				}
			}
			// if we're not collecting
			else {
				if (api.isAfter()) {
					// watch for "collect" events
					if ('collect' == type) {
						startCollecting(data);
					}
				}
			}

		};

		function startCollecting (data) {
			collector = data;
			if (isArray(collector)) {
				// collector is the collection. append to it
				collection = collector;
			}
			else if (isArray(data[collProp])) {
				// found the collection property. append to it
				collection = data[collProp];
			}
			else {
				// create a collection property
				collection = data[collProp] = [];
			}
			index = {};
		}

		function stopCollecting () {
			collector = index = null;
		}

		function collect (item, id) {
			index[id] = collection.push(item) - 1;
		}

		function uncollect (item, id) {
			var pos = index[id];
			if (pos >= 0) {
				collection.splice(pos, 1);
				delete index[id];
				adjustIndex(pos);
			}
		}

		function adjustIndex (fromPos) {
			var id;
			for (id in index) {
				if (index[id] > fromPos) {
					index[id]--;
				}
			}
		}

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));