/**
 * joinpointObserver
 * @author: brian
 */
(function(define) {
define(function(require) {

	var when, propertyChangeObserver, undef;

	when = require('when');
	propertyChangeObserver = require('../tx/propertyChangeObserver');

	return function(observerTests, resultObserver) {

		return function(joinpoint) {

			var name, target, args, observer;

			target = joinpoint.target;
			args = joinpoint.args;

			// Find candidate objects in method arguments,
			// and in target object's properties

			var prepared = args.reduce(function(prepared, candidate) {
				var observer = findObserver(observerTests, candidate);
				if(observer) {
					prepared.push(observer(candidate).bind(undef, candidate));
				}

				return prepared;
			}, []);

			for(name in target) {
				observer = findObserver(observerTests, target[name]);
				if(observer) {
					observer = propertyChangeObserver(name, observer);
					prepared.push(observer(target).bind(undef, target));
				}
			}

			return function(result) {
				if(resultObserver) {
					prepared.push(resultObserver(result));
				}
				return function(tx) {
					return when.all(prepared.map(function(observer) {
						return observer(tx);
					}));
				};
			};
		};

	};

	function findObserver(tests, candidate) {
		var found;

		tests.some(function(test) {
			var observer = test(candidate);
			if(observer) {
				found = observer;
				return true;
			}
		});

		return found;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
