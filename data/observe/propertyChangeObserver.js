(function(define) {
define(function(require) {

	var mappedChangeObserver = require('./mappedObserver');

	return function wrapObserver(property, observer) {
		return mappedChangeObserver(function(object) {
			return object[property];
		}, observer);
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
