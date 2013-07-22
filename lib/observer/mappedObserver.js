(function(define) {
define(function() {

	return function createObserver(map, observer) {
		return function(x) {
			observer = observer(map(x));

			return function(y, tx) {
				return observer(map(y), tx);
			};
		};
	};


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
