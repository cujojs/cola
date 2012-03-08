(function (define) {
define(function (require, exports) {

	// TODO: use has() to select code to use node.classList / DOMSettableTokenList

	var splitClassNameRx = /\s+/;

	function getClassList (node) {
		return node.className.split(splitClassNameRx);
	}

	function setClassList (node, list) {
		return node.className = list.join(' ');
	}

	function getClassSet (node) {
		var set, i;
		set = {};
		node.className.replace(splitClassNameRx, function (name) {
			set[name] = true;
		});
		return set;
	}

	/**
	 *
	 * @param node
	 * @param set {Object}
	 * @description
	 * Example bindings:
	 * stepsCompleted: {
	 *   node: 'viewNode',
	 *   prop: 'classList',
	 *   enumSet: ['one', 'two', 'three']
	 * },
	 *  permissions: {
	 * 		node: 'myview',
	 * 		prop: 'classList',
	 * 		enumSet: {
	 * 			modify: 'can-edit-data',
	 * 			create: 'can-add-data',
	 * 			remove: 'can-delete-data'
	 * 		}
	 *  }
	 */
	function setClassSet (node, set) {
		var removes, adds, p, newList;

		removes = [];
		adds = [];

		for (p in set) {
			if (set[p]) {
				adds.push(p);
			}
			else {
				removes.push(p);
			}
		}

		newList = [ node.className.replace(classListParser(removes), '') ];
		newList = newList.concat(adds);

		return node.className = newList.join(' ');
	}

	function toString (o) { return Object.prototype.toString.apply(o); };

	function isArray (obj) {
		return toString(obj) == '[object Array]';
	}

	function isString (obj) {
		return toString(obj) == '[object String]';
	}

	// class parsing

	var openRx, closeRx, innerRx;

	openRx = '(\\s+|^)';
	closeRx = '(\\s+|$)';
	innerRx = openRx + '|' + closeRx;

	function classListParser (classList) {
		return new RegExp(openRx
			+ classList.join(innerRx)
			+ closeRx);
	}

	return {
		getClassList: getClassList,
		setClassList: setClassList,
		getClassSet: getClassSet,
		setClassSet: setClassSet
	};

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));