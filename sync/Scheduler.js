/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function() {

	function Scheduler() {
		this._tasks = [];
	}

	Scheduler.prototype = {
		periodic: function(t, period, handleError) {
			this._schedule({ run: t, period: period, handleError: handleError });
		},

		cancel: function(t) {
			this._tasks.some(function(task, i, tasks) {
				if(task.run === t) {
					tasks.splice(i, 1);
					return true;
				}
			});
		},

		_schedule: function(task) {
			var now = Date.now();
			this._insertTask(now, task);
			this._scheduleNextRun(now);
		},

		_insertTask: function(now, task) {
			task.deadline = task.deadline
				? task.deadline + task.period
				: now + task.period;

			task.arrival = task.arrival
				? task.arrival + task.period
				: now;

			this._tasks.push(task);
			this._tasks.sort(byDeadline);
		},

		_scheduleNextRun: function(now) {
			var self = this;
			var nextArrival = Math.max(0, this._tasks[0].arrival - now);

			if(this._timer) {
				clearTimeout(this._timer);
				this._timer = void 0;
			}

			this._timer = setTimeout(function() {
				self._runReadyTasks();
			}, nextArrival);
		},

		_runReadyTasks: function() {
			var task, now = Date.now();
			while(this._tasks.length > 0 && this._tasks[0].arrival <= now) {
				task = this._tasks.shift();
				try {
					task.run();
				} catch(e) {
					if(typeof task.handleError === 'function') {
						task.handleError(e);
					} else {
						fatal(e);
					}
				} finally {
					this._insertTask(Date.now(), task);
				}
			}

			this._scheduleNextRun(Date.now());
		}
	};

	return Scheduler;

	function byDeadline(t1, t2) {
		return t1.deadline < t2.deadline ? -1
			: t1.deadline > t2.deadline ? 1
			: 0;
	}

	function fatal (e) {
		setTimeout(function () {
			throw e;
		}, 0);
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
