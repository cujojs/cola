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

    function ArrayIndex(identify, array) {
        this.index = createIndex(identify, array);
    }

    ArrayIndex.prototype.find = function(id) {
        return this.index[id];
    };

    return ArrayIndex;

    function createIndex(id, array) {
        return array.reduce(function (index, item, i) {
            index[id(item)] = i;
            return index;
        }, {});
    }

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
