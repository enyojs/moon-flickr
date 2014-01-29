/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

enyo.kind({
	name: "flickr.MainView",
	classes: "moon enyo-fit",
	handlers: {
		onRequestPushPanel: "pushPanel",
		onRequestFullScreen: "fullscreen",
		onRequestSlideshowStart: "startSlideshow"
	},
	components: [
		{kind: "flickr.Slideshow", classes: "enyo-fit", src:"assets/splash.png"},
		{kind: "moon.Panels", classes: "enyo-fit", pattern: "alwaysviewing", popOnBack:true, components: [
			{kind: "flickr.SearchPanel"}
		]}
	],
	bindings: [
		{from: ".$.panels.showing", to:".panelsShowing"}
	],
	create: function() {
		this.inherited(arguments);
		this.set("photos", new flickr.SearchCollection());
		this.$.searchPanel.set("photos", this.photos);
		this.$.slideshow.set("photos", this.photos);
	},
	pushPanel: function(inSender, inEvent) {
		this.$.panels.pushPanel(inEvent.panel);
	},
	fullscreen: function(inSender, inEvent) {
		this.$.slideshow.set("src", inEvent.model.get("original"));
		this.$.panels.hide();
	},
	startSlideshow: function() {
		this.$.slideshow.start();
		this.$.panels.hide();
	},
	panelsShowingChanged: function() {
		if (this.panelsShowing) {
			this.$.slideshow.stop();
		}
	}
});

enyo.kind({
	name: "flickr.Slideshow",
	kind: "enyo.ImageView",
	src: "assets/splash.png",
	published: {
		photos: null,
		delay: 3000
	},
	index: 0,
	start: function() {
		this.next(true);
	},
	next: function(start) {
		if (!start) {
			this.index++;
			if (this.index > this.photos.length) {
				this.index = 0;
			}
		}
		this.setSrc(this.photos.at(this.index).get("original"));
		this.startJob("slideshow", "next", this.delay);
	},
	stop: function() {
		this.stopJob("slideshow");
		this.setSrc("assets/splash.png");
	}
});

enyo.kind({
	name: "flickr.SearchPanel",
	kind: "moon.Panel",
	published: {
		photos: null
	},
	events: {
		onRequestPushPanel: "",
		onRequestSlideshowStart: ""
	},
	handlers: {
		onInputHeaderChange: "search"
	},
	title: "Search Flickr",
	titleBelow: "Enter search term above",
	headerOptions: {inputMode: true, dismissOnEnter: true},
	headerComponents: [
		{kind: "moon.Spinner", content: "Loading...", name: "spinner"},
		{kind: "moon.Button", small:true, name:"startButton", content: "Start Slideshow", ontap: "startSlideshow"}
	],
	components: [
		{kind: "moon.DataGridList", fit:true, name: "resultList", minWidth: 250, minHeight: 300, ontap: "itemSelected", components: [
			{kind: "moon.GridListImageItem", imageSizing: "cover", useSubCaption:false, centered:false, bindings: [
				{from: ".model.title", to:".caption"},
				{from: ".model.thumbnail", to:".source"}
			]}
		]}
	],
	bindings: [
		{from: ".photos", to: ".$.resultList.collection"},
		{from: ".photos.isFetching", to:".$.spinner.showing"},
		{from: ".photos.length", to:".$.startButton.showing"}
	],
	search: function(inSender, inEvent) {
		this.$.resultList.collection.set("searchText", inEvent.originator.get("value"));
	},
	itemSelected: function(inSender, inEvent) {
		this.photos.set("selected", inEvent.model);
		this.doRequestPushPanel({panel: {kind: "flickr.DetailPanel", model: inEvent.model}});
	},
	startSlideshow: function() {
		this.doRequestSlideshowStart();
	}
});

enyo.kind({
	name: "flickr.DetailPanel",
	kind: "moon.Panel",
	events: {
		onRequestFullScreen: ""
	},
	layoutKind: "FittableColumnsLayout",
	components: [
		{kind: "moon.Image", name: "image", fit: true, sizing:"contain", ontap:"requestFullScreen"}
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
			return "By " + (val || " unknown user");
		}},
		{from: ".model.taken", to: ".subTitleBelow", transform: function(val) {
			return val ? "Taken " + val : "";
		}},
		{from: ".model.original", to: ".$.qr.src", transform: function(val) {
			return val ? "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" + encodeURIComponent(val) : "";
		}}
	],
	transitionFinished: function(inInfo) {
		if (inInfo.from < inInfo.to) {
			this.model.fetch();
		}
	},
	requestFullScreen: function() {
		this.doRequestFullScreen({model: this.model});
	}
});

enyo.kind({
	name: "flickr.ImageModel",
	kind: "enyo.Model",
	readOnly: true,
	defaultSource: "flickr",
	attributes: {
		thumbnail: function() {
			return "http://farm" + this.get("farm") +
				".static.flickr.com/" + this.get("server") +
				"/" + this.get("id") + "_" + this.get("secret") + "_m.jpg";
		},
		original: function() {
			return "http://farm" + this.get("farm") +
				".static.flickr.com/" + this.get("server") +
				"/" + this.get("id") + "_" + this.get("secret") + ".jpg";
		}
	},
	computed: {
		thumbnail: ["farm", "server", "id", "secret"],
		original: ["farm", "server", "id", "secret"]
	},
	getUrl: null,
	fetch: function(opts) {
		this.params = {
			method: "flickr.photos.getinfo",
			photo_id: this.get("id")
		};
		return this.inherited(arguments);
	},
	parse: function(data) {
		data = data.photo || data;
		data.title = data.title._content || data.title;
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
		this.destroyAll();
		this.fetch();
	},
	fetch: function(opts) {
		this.params = {
			method: "flickr.photos.search",
			sort: "interestingness-desc",
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
	fetch: function(rec, opts) {
		opts.callbackName = "jsoncallback";
		opts.params = enyo.clone(rec.params);
		opts.params.api_key = "2a21b46e58d207e4888e1ece0cb149a5";
		opts.params.format = "json";
		this.inherited(arguments);
	}
});
enyo.store.addSources({flickr: "flickr.Source"});