/**
 * Model
 * @author: brian
 */
(function(define) {
define(function(require) {

	var Base, resolver;

	Base = require('./hub/Base');
	resolver = require('./objectAdapterResolver');

	function Model(options) {
		Base.call(this, options);
	}

	Model.prototype = Object.create(Base.prototype, {

		resolver: { value: resolver }

	});

	return Model;

});
}(typeof define === 'function' ? define : function(factory) { module.exports = factory(require); }));
