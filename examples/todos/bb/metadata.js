/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
* Licensed under the MIT License at:
* http://www.opensource.org/licenses/mit-license.php
*
* @author: Brian Cavalier
* @author: John Hann
*/

(function(define) { 'use strict';
define(function() {


	var modelMetadata = {
		id: function(model) {
			return model.get(model._idAttribute);
		},

		get: function(model, name) {
			return model.get(name);
		},
		set: function(model, name, value) {
			return mode.set(name, value);
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
