(function (define) {
define(function (require, exports) {

	// TODO: use has() to select code to use node.classList / DOMSettableTokenList

	var splitClassNameRx = /\s+/;

	/**
	 * Returns the list of class names on a node as an array.
	 * @param node {HTMLElement}
	 * @returns {Array}
	 */
	function getClassList (node) {
		return node.className.split(splitClassNameRx);
	}

	/**
	 * Adds a list of class names on a node and optionally removes some.
	 * @param node {HTMLElement}
	 * @param list {Array|Object} a list of class names to add.
	 * @param [list.add] {Array} a list of class names to add.
	 * @param [list.remove] {Array} a list of class names to remove.
	 * @returns {Array} the resulting class names on the node
	 *
	 * @description The list param may be supplied with any of the following:
	 *   simple array:
	 *     setClassList(node, ['foo-box', 'bar-box']) (all added)
	 *   simple array w/ remove property:
	 *     list = ['foo-box', 'bar-box'];
	 *     list.remove = ['baz-box'];
	 *     setClassList(node, list);
	 *   object with add and remove array properties:
	 *     list = {
	 *       add: ['foo-box', 'bar-box'],
	 *       remove: ['baz-box']
	 *     };
	 *     setClassList(node, list);
	 */
	function setClassList (node, list) {
		var adds, removes;
		if (list) {
			// figure out what to add and remove
			adds = list.add || list || [];
			removes = list.remove || [];
			node.className = spliceClassNames(node.className, removes, adds);
		}
		return getClassList(node);
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
	 * 	stepsCompleted: {
	 *  	node: 'viewNode',
	 *  	prop: 'classList',
	 *  	enumSet: ['one', 'two', 'three']
	 * 	},
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
			if (p) {
				if (classSet[p]) {
					adds.push(p);
				}
				else {
					removes.push(p);
				}
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

	/**
	 * Adds and removes class names to a tokenized, space-delimited string.
	 * @private
	 * @param className {String} current className
	 * @param removes {Array} class names to remove
	 * @param adds {Array} class names to add
	 * @returns {String} modified className
	 */
	function spliceClassNames (className, removes, adds) {
		var rx, leftovers;
		// create regex to find all removes *and adds* since we're going to
		// remove them all to prevent duplicates.
		rx = new RegExp(openRx
			+ removes.concat(adds).join(innerRx)
			+ closeRx, 'g');
		// remove and clean up whitespace
		leftovers = className.replace(rx, '').replace(trimLeadingRx, '');
		// put the adds back in
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