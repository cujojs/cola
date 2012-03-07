/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	var concat, slice;

	concat = Array.prototype.concat;
	slice  = Array.prototype.slice;

	identity.inverse = identity;
	identity.inverse.inverse = identity;

	return function(transforms) {
		var composed, txList, inverses;

		if(arguments.length == 0) return identity;

		txList = concat.apply([], slice.call(arguments));

		composed = function(it) {
			for(var i = 0, len = txList.length; i < len; i++) {
				it = txList[i](it);
			}

			return it;
		};

		// If all transforms have inverses, we can also compose
		// an inverse transform
		inverses = collectInverses(txList);

		if(inverses.length) {
			composed.inverse = function(it) {
				for(var i = inverses.length - 1; i >= 0; --i) {
					it = inverses[i](it);
				}

				return it;
			}
		}

		return composed;
	};

	/**
	 * Collects all .inverses of the supplied transforms.
	 * @param transforms {Array} array of transforms, either *all* or *none* of
	 * which must have .inverse functions.
	 */
	function collectInverses(transforms) {
		var inverse, inverses;

		inverses = [];

		for(var i = 0, len = transforms.length; i < len; i++) {
			inverse = transforms[i].inverse;
			if(typeof inverse == 'function') inverses.push(inverse);
		}

		if(inverses.length > 0 && inverses.length !== transforms.length) {
			throw new Error("Either all or none of the supplied transforms must provide an inverse");
		}

		return inverses;
	}

	function identity(it) {
		return it;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));
