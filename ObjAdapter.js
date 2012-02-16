define(['./Watchable'], function (makeWatchable) {
"use strict";

	/**
	 * @constructor
	 * @param obj {Object}
	 * @returns {Watchable}
	 */
	function ObjAdapter (obj) {

		this.watchable = makeWatchable(obj);

	}

	ObjAdapter.prototype = {

		/**
		 * Translates a name to a property or sub-object. For the ObjAdapter,
		 * this is a passthru unless overridden or another function is injected.
		 * @param name {String} the name of the property
		 * @returns {String}
		 */
		resolveName: function (name) {
			return name;
		},

		setOptions: function (options) {
			// TODO: use these to specify translations in resolveName? or use a separate resolver object in the mediator
			this._options = options;
		},

		watchProp: function (name, callback) {
			return this.watchable.watch(this.resolveName(name), callback);
		},

		watchAllProps: function (callback) {
			return this.watchable.watch(this.resolveName('*'), callback);
		},

		propChanged: function (value, name) {
			this.watchable.set(this.resolveName(name), value);
		}

	};

	return ObjAdapter;

});
