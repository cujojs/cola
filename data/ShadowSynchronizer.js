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
	var when = require('when');

	function ShadowSynchronizer(clients) {
		this.clients = clients;
	}

	ShadowSynchronizer.prototype = {
		set: function(data) {
			this.startSync(this.clients, data);
		},

		fromSource: function(source) {
			var self = this;
			return when(source.get(), function(data) {
				self.set(data);
				return self;
			});
		},

		startSync: function(clients, data) {
			this._shadow = jsonPatch.snapshot(data);

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

				start = nextIndex(start, len);
				syncClientIndex(client, start);

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
					index = nextIndex(index, len);
					setTimeout(function() {
						syncClientIndex(client, index);
					}, 0);
				}
			}

			function syncClientIndex(client, start) {
				var patch = client.diff(self._shadow);
				if(patch && patch.length) {
					patch = jsonPatch.snapshot(patch);
					self._shadow = jsonPatch.patch(patch, self._shadow);

					return patchClients(patch, clients.slice(start, start + len - 1));
				}
			}

			function patchClients(patch, clientsToPatch) {
				return clientsToPatch.map(function(c) {
					return c.patch(patch);
				});
			}
		}
	};

	return ShadowSynchronizer;

	function nextIndex(i, len) {
		return (i + 1) % len;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
