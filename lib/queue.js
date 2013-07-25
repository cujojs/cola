/**
 * queue
 * @author: brian
 */
(function(define) {
define(function(require) {

	var when = require('when');

	/**
	 * Create a task queue that allows only 1 task to execute
	 * in parallel.
	 * @return {function} function to enqueue tasks
	 */
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
