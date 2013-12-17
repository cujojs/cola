/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var Dom = require('./Dom');
	var DocumentView = require('../data/DocumentView');
	var Synchronizer = require('../data/ShadowSynchronizer');
	var when = require('when');

	return function(root, datasource, handler) {
		if(!handler) {
			handler = defaultHandler;
		}

		Array.prototype.reduce.call(root.children, function(next, node) {
			return when(next, function() {
				var path = node.getAttribute('data-path');
				var data, view;
				if(path != null) {
					data = new DocumentView(path, datasource);
					view = new Dom(node);

					return when(handler(view, data));
				}

				return next;
			})
		}, when.resolve());
	};

	function defaultHandler(view, data) {
		var s = new Synchronizer([view, data]);
		return when(data.get(), function(data) {
			s.set(data);
		});
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
