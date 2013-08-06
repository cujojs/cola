(function (define) {
define(function (require) {

	var jsonpath = require('../lib/jsonpath');
	var undef;

	return nested;

	/**
	 *
	 * If the jsonPath specifies a property that cannot be navigated,
	 * the missing parameter is called.  If there is no missing parameter,
	 * an Error is thrown.
	 * @param {Function} getter gets a property of an object
	 * @param {Function} setter sets a property on an object
	 * @param {Function} missing is a function that provides a value
	 *   when the property or some part of the structure is missing.
	 * @param {Function} construct is a function that is provided
	 *   the current property name as well as the full path and returns an
	 *   object. This object is used to construct the structure when it is
	 *   doesn't yet exist.  Use the included construct function to create
	 *   object literals or arrays, as necessary. If omitted, an error is
	 *   thrown if the structure doesn't already exist.
	 * @returns {{get: Function, set: Function}}
	 */
	function nested (getter, setter, construct, missing) {

		if (!missing) missing = prematureEnd;
		if (!construct) construct = prematureEnd;

		return { get: get, set: set };

		/**
		 * Gets a value within a complex Object/Array structure using
		 * json-path-like syntax.  A path in the following form:
		 *   'items[1].thing'
		 * will navigate to the 2nd "thing" property in this structure:
		 *   { items: [ { thing: 'foo' }, { thing: 'bar' } ] }
		 * The path could also be written in these other ways:
		 *   'items.1.thing'
		 *   'items[1]["thing"]'
		 * @param {Object|Array} obj an arbitrarily complex structure of Object
		 *   and Array types.
		 * @param {String} path is a jsonPath descriptor of a property in obj.
		 * @return {*}
		 */
		function get (obj, path) {
			if (!obj) return missing('', path);
			try {
				return walk(obj, String(path));
			}
			catch (ex) {
				if (ex.prop) return missing(ex.prop, path);
				else throw ex;
			}
		}

		/**
		 * Sets a value within a complex Object/Array structure using
		 * jsonPath-like syntax.  If the jsonPath specifies a property that
		 * cannot be navigated, an Error is thrown.
		 * @param {Object|Array} obj an arbitrarily complex structure of Object
		 *   and Array types.
		 * @param {String} path is a jsonPath descriptor of a property in obj.
		 * @param {*} [value] sets the value of the property described
		 *   by path.
		 * @param {Boolean} build should be true to construct the structure
		 *   as needed.
		 * @return {*}
		 */
		function set (obj, path, value, build) {
			var popLast, end;
			// pop off last property
			popLast = jsonpath.pop(String(path));
			end = walk(obj, popLast.path, build);
			if (undef !== end) {
				setter(end, popLast.name, value);
			}
			else {
				prematureEnd(popLast.name, path);
			}
			return obj;
		}

		function walk (obj, path, build) {
			var popped, parent, prop;

			if (path.length == 0) return obj;

			popped = jsonpath.pop(path);
			if (!popped.name) throw new Error('json-path parsing error: ' + path);

			parent = walk(obj, popped.path, build);
			prop = getter(parent, popped.name);

			if (build && undef === prop) {
				prop = construct(popped.name, path);
				setter(parent, popped.name, prop);
			}

			return prop;
		}
	}

	function prematureEnd (name, path) {
		var err = new Error('incomplete json-path structure. ' + name + ' not found in ' + path);
		err.prop = name;
		err.path = path;
		throw err;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
