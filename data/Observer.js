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

	function DocObserver(editor) {
		this.editor = editor;
	}

	DocObserver.prototype = {
		map: function(f) {
			var editor = this.editor;
			return new DocObserver(function(transactionState) {
				var result = editor(transactionState);
				return [when(result[0], f), result[1]];
			});
		},

		edit: function(doc) {
			var result = this.editor(doc);
			return when.join(result[0], result[1])
				.spread(function(data, diff) {
					return diff(data);
				});
		}
	};

	DocObserver.begin = function() {
		return new DocObserver(function(doc) {
			var data = doc.fetch();

			return [data, when(data, doc.metadata.diff.bind(doc.metadata))];
		});
	};

	return DocObserver;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
