/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var merge = require('wire/config/merge');
	var fluent = require('wire/config/fluent');
	var role = require('wire/query/role');
	var dom = require('wire/dom');
	var Map = require('wire/lib/Map');

	var path = require('../lib/path');
	var Dom = require('../dom/Dom');
	var Registration = require('../dom/Registration');
	var form = require('../dom/form');
	var ProxyClient = require('../data/ProxyClient');
	var Memory = require('../data/Memory');
	var Synchronizer = require('../sync/Synchronizer');
	var Scheduler = require('../sync/Scheduler');

	var when = require('when');

	var isController = role('controller');
	var isModel = role('model');

	var EventDispatcher = require('../dom/EventDispatcher');

	var reduce = Array.prototype.reduce;

	return function (context) {
		return context
			.configure(dom)
			.configure(enableObjectConfig)
			.configure(fluent(bardInit));
	};

	function bardInit(config) {
		var proxies = new Map();
		var scheduler = new Scheduler();

		return config
			.add('@lifecycle', function () {
				return {
					postCreate: function (instance, component) {
						if (Array.isArray(component)) {
							return instance;
						}

						if (isController(component)) {
							var proxy = new ProxyClient();
							instance = proxy.proxy(instance);
							proxies.set(instance, proxy);
						} else if (isModel(component)) {
							instance = getDatasource(instance);
						}

						return instance;
					}
				}
			})
			.add('views@init', function (context) {
				return context.resolve(['qsa'], function (qsa) {
					qsa = qsa[0];
					var bardContainers = qsa('[data-bard]');

					return reduce.call(bardContainers, addViews, context);

					function addViews(context, root) {

						context.add('@root', function () {
							return root;
						});

						return reduce.call(qsa('[data-path]', root), function (context, node) {
							var n = node.parentNode;
							while (n !== root && !n.hasAttribute('data-path')) {
								n = n.parentNode;
							}

							if (n === root) {
								context.add(node.getAttribute('data-path') + '@view', function () {
									return node;
								});
							}

							return context;
						}, context);
					}
				});
			})
			.add('events@startup', function (context) {
				return context.resolve(['sync@startup'], function () {
					return context.resolve(['@root'], function (views) {
						return views.map(function (view) {
							return createEventDispatcher(view, context, proxies);
						});
					});
				});
			})
			.add('sync@startup', function (context) {
				var models = context.findComponents('@model');
				return models.reduce(function (registrations, model) {
					return registrations.concat(processModel(model));
				}, []);

				function processModel(model) {
					var path = model.metadata.roles.model;
					return context.resolve([path + '@model', path + '@view', path + '@controller'], function(models, views, controllers) {
						var clients = models.concat(views.map(function(node) {
								return new Dom(node);
							})).concat(controllers.reduce(function(controllers, c) {
								var proxy = proxies.get(c);
								return proxy ? controllers.concat(proxy) : controllers;
							}, []));

						return sync(models[0], clients);
					});
				}

				function sync(source, clients) {
					var s = new Synchronizer(clients);
					var period = Math.floor(100 / clients.length);
					return s.fromSource(source).then(function () {
						scheduler.periodic(s.sync.bind(s), period);
					});
				}
			});

	}

	function enableObjectConfig(context) {
		return Object.create(context, {
			configure: {
				value: function (config) {
					if (config && typeof config === 'object') {
						return configureWithObject(config, context);
					} else {
						return context.configure.apply(this, arguments);
					}
				}
			}
		});

		function configureWithObject(object, context) {
			return Object.keys(object).reduce(function (context, key) {
				return context.add(keyToMetadata(key), function () {
					return object[key];
				});
			}, context);
		}

		function keyToMetadata(key) {
			if (/controller$/i.test(key)) {
				return key.slice(0, key.length - 10) + '@controller'
			} else if (/model$/i.test(key)) {
				return key.slice(0, key.length - 5) + '@model';
			} else if (/view/i.test(key)) {
				return key.slice(0, key.length - 4) + '@view';
			}
		}
	}

	function createEventDispatcher(view, context, proxies) {
		return new EventDispatcher(createEventHandler(context, proxies), view);
	}

	function createEventHandler(context, proxies) {
		return 	function eventHandler (e, target, expression) {
			handleEvent(e, expression, context, proxies);
		}
	}

	function handleEvent(e, expression, context, proxies) {
		var query, method, path, args;

		if (/\S+\.\S+/.test(expression)) {
			expression = expression.split('.');
			query = expression[0];
			method = expression[1];
		}

		if (query) {
			args = [e];

			if (e.type === 'submit') {
				query = [query];
				e.preventDefault();
				args.unshift(form.getValues(e.target));
			} else {
				path = query.split('@');
				query = [query];
				if (path.length > 1) {
					query.push(path[0] + '@view');
				}
			}

			context.resolve(query, function (targets, views) {
				if (views) {
					args.unshift.apply(args, buildArgs(views, targets, proxies, e));
				}

				return targets.map(function (target) {
					var result = target[method].apply(target, args);
					if (e.target.reset) {
						e.target.reset();
					}
					return result;
				});
			});
		}
	}

	function buildArgs(views, controllers, proxies, e) {
		return views.reduce(function (args, view) {
			var path = Registration.buildPath(view, e.target);
			return controllers.reduce(function (args, controller) {
				var proxy = proxies.get(controller);
				if(proxy) {
					args.push(proxy.get(path));
				}

				return args;
			}, args);
		}, []);
	}

	function getDatasource(x) {
		if (typeof x === 'object'
			&& typeof x.get === 'function') {
			return x;
		}

		return new Memory(x);
	}

});
}(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }));
