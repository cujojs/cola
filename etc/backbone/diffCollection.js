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

	return function(before) {
		var changes = [];

		before.on('add', trackAdds);
		before.on('change', trackChanges);
		before.on('remove', trackRemoves);
		// FIXME: Should we actually track this??
		// Backbone doesn't fire model events for reset, and
		// doesn't destroy models, so perhaps we should put
		// the responsibility on the developer?
		before.on('reset', trackReset);

		return function(/* after */) {
			before.off('add', trackAdds);
			before.off('change', trackChanges);
			before.off('remove', trackRemoves);
			// FIXME: See above
			before.off('reset', trackReset);

			return changes;
		};

		function trackReset(collection, aux) {
			aux.previousModels.forEach(trackRemoves);
			collection.forEach(trackAdds);
		}

		function trackAdds(model) {
			var modelWrapper = {};
			modelWrapper[model.cid] = model;

			changes.push({
				type: 'new',
				name: model.cid,
				object: modelWrapper
			});
		}

		function trackChanges(model) {
			var modelWrapper;

			modelWrapper = {};
			modelWrapper[model.cid] = model;

			changes.push({
				type: 'updated',
				name: model.cid,
				object: modelWrapper,
				oldValue: createPreviousValueProxy(model)
			});
		}

		function trackRemoves(model) {
			changes.push({
				type: 'deleted',
				name: model.cid,
				object: {},
				oldValue: model
			});
		}
	};

	function createPreviousValueProxy(model) {
		return Object.create(model, {
			get: { value: function(name) {
					return this.previous(name);
				}
			}
		});
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
