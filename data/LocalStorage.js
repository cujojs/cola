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
	 * @constructor
	 */
	function LocalStorage(namespace, init, identify) {
		this._namespace = namespace || '';
		this._init = init || defaultInit;
		this.metadata = new JsonMetadata(identify);
	}

	LocalStorage.prototype = {
		get: function(path) {
			var data = this._load();
			return jsonPointer.getValue(data, path, data);
		},

		update: function(patch) {
			this._save(this.metadata.patch(this._load(), patch));
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
