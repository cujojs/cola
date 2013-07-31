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

	return {
		model: {
			id: function(model) {
				return model & model.get(model._idAttribute);
			},

			get: function(model, name) {
				return model && model.get(name);
			},
			set: function(model, name, value) {
				model && model.set(name, value);
			}
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
