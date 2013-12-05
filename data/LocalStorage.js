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

	var jsonPointer, jsonPatch, JsonMetadata;

	jsonPointer = require('../lib/jsonPointer');
	jsonPatch = require('../lib/jsonPatch');
	JsonMetadata = require('./metadata/JsonMetadata');

	/**
	 * A LocalStorage datasource
	 * @param {string} namespace namespace to use to store data in localstorage
	 * @param {object?} options
	 * @param {object?} options.localStorage LocalStorage API to use, defaults to
	 *  window.localStorage
	 * @param {function?} options.init function used to initialize localStorage
	 *  namespace when it's found to be non-existent
	 * @param {function?} options.id identifier function for data items
	 * @constructor
	 */
	function LocalStorage(namespace, init, identify) {
		this._namespace = namespace || '';
		this._init = init || defaultInit;

		this.metadata = new JsonMetadata(identify);
	}

	LocalStorage.prototype = {
		fetch: function(path) {
			return jsonPatch.snapshot(jsonPointer.getValue(this._load(), path));
		},

		update: function(changes, path) {
			var data = this._load();
			jsonPointer.setValue(data, path,
				this.metadata.patch(jsonPointer.getValue(data, path), changes));
			this._save(data);
		},

		_load: function() {
			var data = localStorage.getItem(this._namespace);
			if(data == null) {
				data = typeof this._init === 'function'
					? this._init()
					: this._init;
			} else {
				data = JSON.parse(data);
			}

			return data;
		},

		_save: function(data) {
			localStorage.setItem(this._namespace, JSON.stringify(data));
		}
	};

	return LocalStorage;

	function defaultInit() {
		return [];
	}

});
})(typeof define == 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }
);
