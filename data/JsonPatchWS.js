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
	var JsonMetadata = require('./metadata/JsonMetadata');
	var rebase = require('jiff/lib/rebase');

	function JsonPatchWS(url, id) {
		this._url = url;
		this.metadata = new JsonMetadata(id);
		this._buffer = [];
	}

	JsonPatchWS.prototype = {
		get: function() {
			if(!this._shadow) {
				return this._listen();
			}

			return this.metadata.clone(this._shadow);
		},

		diff: function(shadow) {
			if(!this._shadow) {
				return;
			}

			return this.metadata.diff(shadow, this._shadow);
		},

		patch: function(patch) {
			if(this._shadow && patch && patch.length > 0) {
				this._patch(patch);
				return this._send(patch);
			}
		},

		_patch: function(patch) {
			this._shadow = this.metadata.patch(this._shadow, patch);
			this._buffer.push(patch);
		},

		_listen: function() {
			var self = this;
			return when.promise(function(resolve) {

				var socket = self._socket = new WebSocket(self._url);
				socket.addEventListener('message', function(message) {
					message = JSON.parse(message.data);

					if(message.data) {
						self._shadow = message.data;
						resolve(self.metadata.clone(self._shadow));

					} else if(self._shadow && message.patch) {
						self._buffer.shift();
						self._patch(rebase(self._buffer, message.patch));
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
