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
		var set, classNames, className;
		set = {};
		classNames = node.className.split(splitClassNameRx);
		while ((className = classNames.pop())) set[className] = true;
		return set;
	}

	/**
	 *
	 * @param node
	 * @param classSet {Object}
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
	function setClassSet (node, classSet) {
		var removes, adds, p, newList;

		removes = [];
		adds = [];

		for (p in classSet) {
			if (classSet[p]) {
				adds.push(p);
			}
			else {
				removes.push(p);
			}
		}

		return node.className = spliceClassNames(node.className, removes, adds);
	}

	// class parsing

	var openRx, closeRx, innerRx, trimLeadingRx;

	openRx = '(\\s+|^)(';
	closeRx = ')(\\b(?![\\-_])|$)';
	innerRx = '|';
	trimLeadingRx = /^\s+/;

	function spliceClassNames (className, removes, adds) {
		var rx, leftovers;
		rx = new RegExp(openRx
			+ removes.join(innerRx)
			+ closeRx, 'g');
		leftovers = className.replace(rx, '').replace(trimLeadingRx, '');
		return (leftovers ? [leftovers].concat(adds) : adds).join(' ');
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