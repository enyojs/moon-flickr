/**
	For simple applications, you might define all of your models, collections,
	and sources in this file.  For more complex applications, you might choose to separate
	these kind definitions into multiple files under this folder.
*/

enyo.singleton({
	name: 'flickr.Constants.Actions',
	search: 'search'
});

enyo.kind({
	name: 'flickr.Store',
	kind: 'enyo.FluxStore',
	source: 'flickrSource',
	update: function(action) {

		//handle dispatched actions to the store
		switch(action.actionType) {
			case flickr.Constants.Actions.search:
				this.search(action.payload);
				break;
			default:
				//default code block
		}
	},
	search: function(data) {
		//do something here with your source
		this.params = data.params;
		this.url = "";
		this.fetch(data);
	}
});

/**
	For simple applications, you might define all of your models, collections,
	and sources in this file.  For more complex applications, you might choose to separate
	these kind definitions into multiple files under this folder.
*/

enyo.kind({
	name: "flickrSource",
	kind: "enyo.JsonpSource",
	urlRoot: "https://api.flickr.com/services/rest/",
	fetch: function(rec, opts) {
		opts.callbackName = "jsoncallback";
		opts.params = enyo.clone(rec.params);
		opts.params.api_key = "2a21b46e58d207e4888e1ece0cb149a5";
		opts.params.format = "json";
		this.inherited(arguments);
	}
});
//enyo.Source.create({kind:'flickrSource'});

new flickrSource({name: "flickrSource"});

enyo.kind({
	name: "flickr.ImageModel",
	kind: "enyo.Model",
	computed: [
		{method: "thumbnail", path: ["farm", "server", "id", "secret"]},
		{method: "original", path: ["farm", "server", "id", "secret"]}
	],
	thumbnail: function() {
		return "https://farm" + this.get("farm") +
			".static.flickr.com/" + this.get("server") +
			"/" + this.get("id") + "_" + this.get("secret") + "_m.jpg";
	},
	original: function() {
		return "https://farm" + this.get("farm") +
			".static.flickr.com/" + this.get("server") +
			"/" + this.get("id") + "_" + this.get("secret") + ".jpg";
	}
});

enyo.kind({
	name: "flickr.Collection",
	kind: "enyo.Collection",
	model: "flickr.ImageModel"
});
