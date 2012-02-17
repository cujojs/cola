/** MIT License (c) copyright B Cavalier & J Hann */

define(['./Watchable'], function (makeWatchable) {
"use strict";

	/**
	 * @constructor
	 * @param obj {Object}
	 * @returns {Watchable}
	 */
	function ObjAdapter (obj) {

		this._watchable = makeWatchable(obj);

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
			return this._watchable.watch(this.resolveName(name), callback);
		},

		watchAllProps: function (callback) {
			return this._watchable.watch(this.resolveName('*'), callback);
		},

		propChanged: function (value, name) {
			// note: this has an intended side-effect: watchers will
			// be notified.
			this._watchable.set(this.resolveName(name), value);
		}

	};

	ObjAdapter.canHandle = function (obj) {
		// this seems close enough to ensure that instanceof works.
		// a RegExp will pass as a valid prototype, but I am not sure
		// this is a bad thing even if it is unusual.
		return obj && typeof obj == 'object';
	};

	return ObjAdapter;

});
