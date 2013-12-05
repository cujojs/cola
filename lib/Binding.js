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

	var when = require('when');
	var most = require('most');
	var bindByAttr = require('../view/bind/byAttr');

	function Binding(dataset, bindable, options) {
		options = Object.create(options || null);

		if(!options.binder) {
			options.binder = bindByAttr();
		}
		options.metadata = dataset.metadata;

		this.dataset = dataset;
		this.bindable = bindable;
		this.options = options;
	}

	Binding.prototype = {
		refresh: function() {
			var dataset = this.dataset;
			var bindable = this.bindable;

			return most(function(next, end) {
				when(dataset.fetch()).done(function(data) {
					var changes = bindable.clear().set(data, dataset.metadata);
					changes.forEach(function(changes) {
						when(dataset.update(changes)).done(function() {
							next(changes);
						});
					});
				}, end);
			});
		},

		update: function(changes) {
			return this.bindable.update(changes);
		},

		unbind: function() {
			return this.bindable.unbind();
		}
	};

	return Binding;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
