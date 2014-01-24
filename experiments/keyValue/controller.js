define(function() {

	return {
		add: function(things, added) {

			if(!added.key || !added.value) {
				return;
			}

			things.push({ key: added.key, value: added.value });
		},

		uniqueId: function(thing) {
			// cheesy but works for now
			return thing.key + ':' + thing.value;
		},

		compare: function(thing1, thing2) {
			var id1, id2;
			id1 = this.uniqueId(thing1);
			id2 = this.uniqueId(thing2);
			return id1 === id2 ? 0 : id1 < id2 ? -1 : 1;
		}
	};

});
