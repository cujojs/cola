/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	function ArrayIndex(identify) {
		this.identify = identify;
	}

	ArrayIndex.prototype = {
		rebuild: function(data) {
			var id = this.identify;
			this.index = data.reduce(function(index, item, i) {
				index[id(item)] = i;
				return index;
			}, {});
		},

		find: function(x) {
			return this.index[this.identify(x)];
		}
	};

	return ArrayIndex;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
