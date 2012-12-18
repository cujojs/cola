/**
 * eventQueue
 * @author: brian
 */
(function(define) {
define(function(require) {

	var when, enqueue;

	when = require('when');
	enqueue = require('../enqueue');

	return {

		/**
		 * Queue an event for processing later
		 * @param source
		 * @param data
		 * @param type
		 */
		queueEvent: function (source, data, type) {
			var queueNeedsRestart;

			// if queue length is zero, we need to start processing it again
			queueNeedsRestart = this.queue.length == 0;

			// enqueue event
			this.queue.push({ source: source, data: data, type: type });

			// start processing, if necessary
			if (queueNeedsRestart) this._dispatchNextEvent();
		},

		/**
		 * Process an event immediately
		 * @param source
		 * @param data
		 * @param type
		 */
		processEvent: function(source, data, type) {
			var self = this;
			this.inflight = when(this.inflight).always(function(){
				return self.eventProcessor(source, data, type);
			});
		},

		_dispatchNextEvent: function () {
			var event, deferred, self;

			self = this;

			// get the next event, if any
			event = this.queue.shift();

			// if there was an event, process it soon
			deferred = when.defer();
			event && enqueue(function () {
				when.chain(self._dispatchEvent(event), deferred);
			});

			deferred.promise.always(function() {
				self._dispatchNextEvent();
			});

			return deferred.promise;
		},

		_dispatchEvent: function(e) {
			return this.processEvent(e.source, e.data, e.type);
		}

	};

});
}(typeof define === 'function' ? define : function(factory) { module.exports = factory(require); }));
