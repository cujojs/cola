/**
 * ObjectHub
 * @author: brian
 */
(function(define) {
define(function(require) {

	var BaseHub, resolver;

	BaseHub = require('./hub/Base');
	resolver = require('./objectAdapterResolver');

	function ObjectHub(options) {
		BaseHub.call(this, options);
	}

	ObjectHub.prototype = Object.create(BaseHub.prototype, {

		resolver: { value: resolver }

	});

	return ObjectHub;

});
}(typeof define === 'function' ? define : function(factory) { module.exports = factory(require); }));
