/** MIT License (c) copyright B Cavalier & J Hann */

(function(window, localStorage, define) {
define(function (require) {

	"use strict";

	var when, undef;

	when = require('when');

	function LocalStorageAdapter(namespace) {
		if(!namespace) throw new Error('cola/LocalStorageAdapter: must provide a storage namespace');

		this._namespace = namespace;
	}

	LocalStorageAdapter.prototype = {

		identifier: undef,
		comparator: undef,

		getOptions: function() {
			return {};
		},

		forEach: function(lambda) {
			var i, len, namespaceLen, key;

			namespaceLen = this._namespace.length + 1;
			for(i = 0, len = localStorage.length; i < len; i++) {
				key = localStorage.key(i);
				if(key.slice(0, namespaceLen) == this._namespace) {
					lambda(localStorage.getItem(key));
				}
			}
		},

		add: function(item) {
			var id, key;

			id = this.identifier(item);
			key = this._namespace + '.items.' + id;

			if(localStorage.getItem(key) === undef) {
				localStorage.setItem(key, item);
			}
		},

		remove: function(item) {
			var id, key;

			id = this.identifier(item);
			key = this._namespace + '.items.' + id;

			localStorage.removeItem(key);
		},

		update: function(item) {
			var id, key;

			id = this.identifier(item);
			key = this._namespace + '.items.' + id;

			localStorage.setItem(key, item);
		},

		clear: function() {
			var i, len, namespaceLen, key;

			namespaceLen = this._namespace.length + 1;
			for(i = 0, len = localStorage.length; i < len; i++) {
				key = localStorage.key(i);
				if(key.slice(0, namespaceLen) == this._namespace) {
					localStorage.removeItem(key);
				}
			}
		}

	};

	return LocalStorageAdapter;

})
})(window, window.localStorage,
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
