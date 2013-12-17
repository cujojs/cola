/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var jsonPatch = require('../lib/jsonPatch');

	function ShadowSynchronizer(clients) {
		this.clients = clients;
	}

	ShadowSynchronizer.prototype = {
		set: function(data) {
			this._shadow = jsonPatch.snapshot(data);
			this.startSync(this.clients, data);
		},

		startSync: function(clients, data) {

			clients.forEach(function(client) {
				// FIXME: Yuck, interface check
				if(client.set) {
					client.set(data);
				}
				client.hint = syncClient;
			});

			var start = 0;
			var len = clients.length;
			var self = this;

			clients = clients.concat(clients);

			runSync();

			function runSync() {
				setTimeout(function() {
					syncNextClient();
					runSync();
				}, 20);
			}

			function syncNextClient() {
				var client = clients[start];

				syncClientIndex(client, start);
				start = (start + 1) % len;

			}

			function syncClient(client) {
				var index;
				clients.some(function(c, i) {
					if(c === client) {
						index = i;
						return true;
					}
				});

				if(typeof index === 'number') {
					setTimeout(function() {
						syncClientIndex(client, index);
					}, 0);
				}
			}

			function syncClientIndex(client, start) {
				start = (start + 1) % len;
				var patch = client.diff(self._shadow);
				if(patch && patch.length) {
					patch = jsonPatch.snapshot(patch);
					self._shadow = jsonPatch.patch(patch, self._shadow);

					for(var i = start, remaining = len-1; remaining > 0; i++, remaining--) {
						clients[i].patch(patch);
					}
				}
			}
		}
	};

	return ShadowSynchronizer;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
