/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function(require) {

	var updateArray, id;

	updateArray = require('./lib/datasource/updateArray');
	id = require('./lib/id');

	function LocalStorage(namespace, options) {
		if(!options) {
			options = {};
		}

		this._namespace = namespace;
		this._storage = options.localStorage || window.localStorage;
		this.id = id(options.id);
		this._update = updateArray(this.id);
	}

	LocalStorage.prototype = {
		fetch: function(/*options*/) {
			var data = this._storage.getItem(this._namespace);
			return data == null ? [] : JSON.parse(data);
		},

		update: function(changes) {
			var data = this._update(this.fetch(), changes);
			this._storage.setItem(this._namespace, JSON.stringify(data));
		}

	};

	return LocalStorage;

});
})(typeof define == 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }
);
