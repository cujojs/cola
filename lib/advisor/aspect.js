(function(define) {
define(function() {

	return function(begin, joinpointObserver) {
		return {
			around: function(joinpoint) {
				var methodResult;

				begin(function() {
					// TODO: How to handle a failure here?
					var observeResult = joinpointObserver(joinpoint);

					methodResult = joinpoint.proceed();

					return [methodResult, observeResult(methodResult)];
				});

				return methodResult;
			}
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
