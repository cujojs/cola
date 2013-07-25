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

	updateArray = require('./update/updateArray');
	id = require('../lib/id');

	function ArrayStorage(array, options) {
		this._array = array || [];
		this.id = id(options && options.id);
		this._update = updateArray(this.id);
	}

	ArrayStorage.prototype = {
		fetch: function(/*options*/) {
			return this._array.slice();
		},

		update: function(changes) {
			this._array = this._update(this._array, changes);
		}
	};

	return ArrayStorage;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
