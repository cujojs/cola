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

	function Synchronizer(clients) {
		this.clients = clients;
	}

	Synchronizer.prototype = {
		set: function(data) {
			startSync(this.clients, data);
		},

		sync: function() {
			this.clients.forEach(function(client, i, clients) {
				updateClients(clients, client);
			});
		}
	};

	function startSync(clients, data) {

		clients.forEach(function(client) {
			// FIXME: Yuck, interface check
			if(client.set) {
				client.set(data);
			}
			client.hint = scheduleSync;
		});

		function scheduleSync(client) {
			setTimeout(function() {
				updateClients(clients, client);
			}, 0);
		}
	}

	function updateClients(clients, client) {
		var patch = client.sync();
		if(patch && patch.length > 0) {
			clients.forEach(function(c) {
				if(c !== client) {
					c.update(patch);
				}
			});
		}
	}

	return Synchronizer;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
