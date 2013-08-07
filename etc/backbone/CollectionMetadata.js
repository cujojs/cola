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

	function Metadata(collection) {
		this.model = new ModelMetadata(collection.model);
	}

	Metadata.prototype = {
		map: mapCollection,
		diff: diffCollection,
		patch: patchCollection
	};

	function ModelMetadata(ModelType) {
		this.ModelType = ModelType;
	}

	ModelMetadata.prototype = {
		create: function() {
			return new this.ModelType();
		},
		id: function(model) {
			return model & model.get(model._idAttribute);
		},
		get: function(model, property) {
			return model && model.get(property);
		},
		set: function(model, property, value) {
			model && model.set(property, value);
		},
		has: function(model, property) {
			return model && model.has(property);
		},
		'delete': function(model, property) {
			return model && model.unset(property);
		}
	}

	return Metadata;

	function mapCollection(collection, f) {
		var proxy = this.model;
		return collection.reset(collection.models.map(function(model) {
			return f(model, proxy);
		}));
	}

	function patchCollection(collection, changes) {
		return changes.reduce(function(collection, change) {

			if(change.type === 'new') {
				collection.add(change.object[change.name]);
			} else if(change.type === 'updated') {
				collection.add(change.object[change.name], { merge: true });
			} else if(change.type === 'deleted') {
				collection.remove(change.name);
			}

			return collection;

		}, collection);
	}

	function diffCollection(before) {
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
	}

	function createPreviousValueProxy(model) {
		return Object.create(model, {
			get: { value: function(name) {
				return this.previous(name);
			}}
		});
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
