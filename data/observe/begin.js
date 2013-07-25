/**
 * begin
 * @author: brian
 */
(function(define) {
define(function(require) {

	var when = require('when');

	return function create(enqueue) {
		var depth = 0, completed;

		return function begin(run) {
			var result;

			if(depth === 0) {
				completed = when.defer();
			}

			try {
				depth += 1;
				result = run();
			} catch(e) {
				result = [when.reject(e), identity];
			} finally {
				depth -=1;
			}

			if(depth === 0) {
				completed.resolve(enqueue(function() {
					return when(result).spread(complete);
				}));
			}

			return completed.promise;
		};
	};

	function complete(bodyResult, committer) {
		return when(bodyResult,
			function(result) {
				return when(committer(when.resolve())).yield(result);
			},
			function(error) {
				return when(committer(when.reject(error)), function() {
					throw error;
				});
			}
		);
	}

	function identity(x) { return x; }

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
