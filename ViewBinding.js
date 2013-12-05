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

	var when = require('when');
	var most = require('most');
	var observe = require('./data/transaction/observe');
	var reactiveCollection = require('./view/array');
	var bindByAttr = require('./view/bind/byAttr');

	function ViewBinding(view, dataset) {
		this.datasetObserver = observe(view, dataset);
		this.viewObserver = reactiveCollection(view, {
			sectionName: dataset.path,
			binder: bindByAttr(),
			metadata: dataset.metadata
		});
	}

	ViewBinding.prototype = {
		refresh: function() {
			var viewObserver = this.viewObserver;
			var datasetObserver = this.datasetObserver;

			return when(datasetObserver.fetch(), function(data) {
				return Array.isArray(data)
					? most.fromArray(data) : most.of(data);
			}).then(function(stream) {
				var data = viewObserver.set(stream);
				var changes = viewObserver.observe()
					.bufferTime(10)
					.map(function(changes) {
						return datasetObserver.update(changes);
					});

				return data.merge(changes).each(noop);
			});
		},

		find: function(e) {
			return this.viewObserver.find(e);
		},

		unbind: function() {
			delete this.datasetObserver;
			delete this.viewObserver;
		}
	};

	return ViewBinding;

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
