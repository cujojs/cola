(function(define) {
define(function() {

	var extendedProto, own;

	extendedProto = Extended.prototype;
	own = Object.prototype.hasOwnProperty;

	function Base() {}

	function Extended() {}

	Base.extend = function (ctor, proto) {
		var prop, targetProto;

		try {
			targetProto = ctor.prototype = new Base();

			for(prop in proto) {
				if(own.call(proto, prop)) {
					targetProto[prop] = proto[prop];
				}
			}
		} finally {
			Extended.prototype = extendedProto;
		}

		return ctor;
	};

	Base.prototype = {
		getOptions: function() {
			return {};
		},

		onAdd: function(item) {},

		onRemove: function(item) {},

		onUpdate: function(item) {},

		onClear: function() {}
	};

	return Base;
});
})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(); }
);
