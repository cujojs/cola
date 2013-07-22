/**
 * queue
 * @author: brian
 */
(function(define) {
define(function(require) {

	var when = require('when');

	return function createQueue() {
		var queue;

		// Append task to queue
		// Returns promiseForTaskResult
		return function enqueue(task) {
			return queue = when(queue, runTask, runTask);

			function runTask() { return task(); }
		};

	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
