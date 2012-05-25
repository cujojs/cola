/** MIT License (c) copyright B Cavalier & J Hann */

(function(global, define) {
define(function (require) {

	"use strict";

	var when, undef;

	when = require('when');

	function LocalStorageAdapter(namespace, options) {
		if (!namespace) throw new Error('cola/LocalStorageAdapter: must provide a storage namespace');

		this._namespace = namespace;

		if (!options) options = {};

		this._idGenerator = options.idGenerator || defaultIdGenerator;
		this._storage = options.localStorage || global.localStorage;

		if(!this._storage) throw new Error('cola/LocalStorageAdapter: localStorage not available, must be supplied in options');

		this.identifier = options.identifier || defaultIdentifier;

		var data = this._storage.getItem(namespace);
		this._data = data ? JSON.parse(data) : {};
	}

	LocalStorageAdapter.prototype = {

		identifier: undef,

		getOptions: function() {
			return {};
		},

		forEach: function(lambda) {
			var data = this._data;
			for(var key in data) {
				lambda(data[key]);
			}
		},

		add: function(item) {
			var id = this.identifier(item);

			if(id === undef) {
				id = this._idGenerator(item);
			}

			if(id in this._data) return null;

			this._data[id] = item;

			this._sync();

			return id;
		},

		remove: function(item) {
			var id = this.identifier(item);

			if(!(id in this._data)) return null;

			delete this._data[id];

			this._sync();

			return item;
		},

		update: function(item) {
			var id = this.identifier(item);

			if(!(id in this._data)) return null;

			this._data[id] = item;

			this._sync();

			return item;
		},

		clear: function() {
			this._storage.removeItem(this._namespace);
		},

		_sync: function() {
			this._storage.setItem(this._namespace, JSON.stringify(this._data));
		}

	};

	return LocalStorageAdapter;

	// GUID-like generation, not actually a GUID, tho, from:
	// http://stackoverflow.com/questions/7940616/what-makes-this-pseudo-guid-generator-better-than-math-random
	function s4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}

	function guidLike() {
		return (s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4());
	}

	function defaultIdGenerator(item) {
		return (item.id = guidLike());
	}

	function defaultIdentifier(item) {
		return item && item.id;
	}

})
})(this.window || global,
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
