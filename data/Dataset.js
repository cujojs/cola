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

	function Dataset(path, datasource) {
		this.path = path;
		this.datasource = datasource;
		this.metadata = datasource.metadata
	}

	Dataset.prototype = {
		fetch: function() {
			return this.datasource.fetch(this.path);
		},

		update: function(changes) {
			return this.datasource.update(changes, this.path);
		}
	};

	return Dataset;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
