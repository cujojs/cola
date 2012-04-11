(function (define) {
define(function () {

	return function configure (options) {
		var first = true;

		return function targetFirstItem (source, dest, data, type, api) {
			if (first && 'update' == type) {
				api.sendEvent('target', data);
				first = false;
			}
			else if ('query' == type) {
				api.sendEvent('target', null);
				first = true;
			}
		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));