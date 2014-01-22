enyo.kind({
	name: "flickr.MainView",
	pattern: "alwaysviewing",
	classes: "moon enyo-fit",
	handlers: {
		onRequestPushPanel: "pushPanel",
		onRequestFullScreen: "fullscreen"
	},
	components: [
		{kind: "enyo.ImageView", classes: "enyo-fit", src:"assets/splash.png"},
		{kind: "moon.Panels", classes: "enyo-fit", pattern: "alwaysviewing", popOnBack:true, components: [
			{kind: "flickr.SearchPanel"}
		]}
	],
	bindings: [
		{from: ".$.panels.showing", to:".$.imageView.style", transform: function(val) {
			return val ? "-webkit-filter: blur(20px); -webkit-transform: scale3d(1,1,1);" : null;
		}}
	],
	pushPanel: function(inSender, inEvent) {
		this.$.panels.pushPanel(inEvent.panel);
	},
	fullscreen: function(inSender, inEvent) {
		this.$.imageView.setSrc(inEvent.model.get("original"));
		this.$.panels.hide();
	}
});

enyo.kind({
	name: "flickr.SearchPanel",
	kind: "moon.Panel",
	classes: "",
	style: "",
	events: {
		onRequestPushPanel: ""
	},
	handlers: {
		onInputHeaderChange: "search"
	},
	title: "Search Flickr",
	titleBelow: "Enter search term above",
	headerOptions: {kind: "moon.InputHeader", dismissOnEnter:true},
	headerComponents: [
		{kind: "moon.Spinner", content: "Loading..."}
	],
	components: [
		{kind: "moon.DataGridList", fit:true, selection:false, name: "resultList", minWidth: 250, minHeight: 300, ontap:"itemSelected", components: [
			{kind: "moon.GridListImageItem", imageSizing: "cover", useSubCaption:false, centered:false, bindings: [
				{from: ".model.title", to:".caption"},
				{from: ".model.thumbnail", to:".source"}
			]}
		]}
	],
	bindings: [
		{from: ".$.resultList.collection.isFetching", to:".$.spinner.showing"}
	],
	create: function() {
		this.inherited(arguments);
		this.$.resultList.set("collection", new flickr.SearchCollection());
	},
	search: function(inSender, inEvent) {
		this.$.resultList.collection.set("searchText", inEvent.originator.get("value"));
	},
	itemSelected: function(inSender, inEvent) {
		this.doRequestPushPanel({panel: {kind: "flickr.DetailPanel", model: inEvent.model}});
	}
});

enyo.kind({
	name: "flickr.DetailPanel",
	kind: "moon.Panel",
	events: {
		onRequestFullScreen: ""
	},
	components: [
		{kind: "moon.Image", sizing:"contain", style:"display:block;", fit:true, ontap:"requestFullScreen"}
	],
	headerComponents: [
		{kind: "moon.Button", ontap:"requestFullScreen", small:true, content:"View Fullscreen"},
		{kind: "moon.ContextualPopupDecorator", components: [
			{kind: "moon.ContextualPopupButton", small: true, content: "QR Code"},
			{kind: "moon.ContextualPopup", components: [
				{kind: "enyo.Image", name:"qr", style:"height: 300px; width: 300px;"}
			]}
		]}
	],
	bindings: [
		{from: ".model.title", to: ".title"},
		{from: ".model.original", to: ".$.image.src"},
		{from: ".model.username", to: ".titleBelow", transform: function(val) {
			return val ? "By " + val : "";
		}},
		{from: ".model.taken", to: ".subTitleBelow", transform: function(val) {
			return val ? "Taken " + val : "";
		}},
		{from: ".model.original", to: ".$.qr.src", transform: function(val) {
			return val ? "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" + encodeURIComponent(val) : "";
		}}
	],
	transitionFinished: function() {
		this.model.fetch();
	},
	requestFullScreen: function() {
		this.doRequestFullScreen({model: this.model});
	}
});

enyo.kind({
	name: "flickr.ImageModel",
	kind: "enyo.Model",
	defaultSource: "flickr",
	fetch: function(opts) {
		this.params = {
			method: "flickr.photos.getinfo",
			photo_id: this.get("id")
		};
		return this.inherited(arguments);
	},
	getUrl: null,
	parse: function(data) {
		var urlprefix;
		data = data.photo || data;
		data.title = data.title._content || data.title;
		urlprefix = "http://farm" + data.farm + ".static.flickr.com/" + data.server + "/" + data.id + "_" + data.secret;
		data.thumbnail = urlprefix + "_m.jpg";
		data.original = urlprefix + ".jpg";
		data.username = data.owner && data.owner.realname;
		data.taken = data.dates && data.dates.taken;
		return data;
	}
});

enyo.kind({
	name: "flickr.SearchCollection",
	kind: "enyo.Collection",
	model: "flickr.ImageModel",
	defaultSource: "flickr",
	published: {
		searchText: null,
	},
	searchTextChanged: function() {
		this.removeAll();
		this.fetch();
	},
	fetch: function(opts) {
		this.params = {
			method: "flickr.photos.search",
			per_page: 50,
			text: this.searchText
		};
		return this.inherited(arguments);
	},
	parse: function(data) {
		return data && data.photos && data.photos.photo;
	}
});

enyo.kind({
	name: "flickr.Source",
	kind: "enyo.JsonpSource",
	urlRoot: "http://api.flickr.com/services/rest/",
	api_key: "2a21b46e58d207e4888e1ece0cb149a5",
	fetch: function(rec, opts) {
		opts.params = rec.params || {};
		enyo.mixin(opts.params, {
			api_key: this.api_key,
			format: "json",
		});
		opts.callbackName = "jsoncallback";
		this.inherited(arguments);
	},
	destroy: function(rec, opts) {
		opts.success();
	}
});
enyo.store.addSources({flickr:"flickr.Source"});
enyo.store.ignoreDuplicates = true;