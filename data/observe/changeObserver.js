(function(define) {
define(function() {

	return function createObserver(prepareDiff, handler) {
		return function(x) {
			var diff = prepareDiff(x);

			return function(y, tx) {
				return handler(diff(y), tx);
			};
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
