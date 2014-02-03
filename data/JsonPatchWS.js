/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var when = require('when');
	var jsonPatch = require('../lib/jsonPatch');
	var path = require('../lib/path');

	function JsonPatchWS(url) {
		this._url = url;
	}

	JsonPatchWS.prototype = {
		get: function(path) {
			if(!this._shadow) {
				return this._listen();
			}

			return jsonPatch.snapshot(this._shadow);
		},

		diff: function(shadow) {
			if(!this._shadow) {
				return;
			}

			return jsonPatch.diff(shadow, this._shadow);
		},

		patch: function(patch) {
			if(this._shadow && patch && patch.length > 0) {
				this._patch(patch);
				return this._send(patch);
			}
		},

		_patch: function(patch) {
			this._shadow = jsonPatch.patch(jsonPatch.snapshot(patch), this._shadow);
		},

		_listen: function() {
			var self = this;
			return when.promise(function(resolve) {

				var socket = self._socket = new WebSocket(self._url);
				socket.addEventListener('message', function(message) {
					message = JSON.parse(message.data);

					if(message.data) {
						console.log('set data', self._shadow);
						self._shadow = message.data;
						resolve(jsonPatch.snapshot(self._shadow));

					} else if(self._shadow && message.patch && message.patch.length > 0) {
						self._patch(message.patch);
						console.log('patch', message.patch, self._shadow);

					}

				});

			});
		},

		_send: function(patch) {
			this._socket.send(JSON.stringify({ patch: patch }));
		}
	};

	return JsonPatchWS;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
