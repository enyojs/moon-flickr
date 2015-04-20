/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/

enyo.kind({
	name: "myapp.Application",
	kind: "enyo.Application",
	view: "flickr.MainView",
	create: function() {
		//create a new instance of the FluxStore
		this.store = new flickr.Store();

		this.inherited(arguments);
	}
});

enyo.ready(function () {
	new myapp.Application({name: "app"});
});
