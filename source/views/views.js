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
		{from: "$.panels.showing", to:"panelsShowing"}
	],
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
	create: function() {
		this.inherited(arguments);
		this.photos = new flickr.Collection();
		enyo.FluxDispatcher.subscribe(this.app.store.id, enyo.bind(this, this.update));
	},
	start: function() {
		this.next(true);
	},
	next: function(start) {
		if (!start) {
			this.index++;
			if (this.index >= this.photos.length) {
				this.index = 0;
			}
		}
		this.set("src", this.photos.at(this.index).get("original"));
		this.startJob("slideshow", "next", this.delay);
	},
	stop: function() {
		this.stopJob("slideshow");
		this.set("src", "assets/splash.png");
	},
	update: function(data) {
		console.log("Slideshow update");
		if (data && data.photos && data.photos.photo) {
			this.photos.empty({destroy:true});
			this.photos.add(data && data.photos && data.photos.photo);
		}
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
		{kind: "moon.Spinner", content: "Loading...", showing:false, name: "spinner"},
		{kind: "moon.Button", small:true, name:"startButton", showing:false, content: "Start Slideshow", ontap: "startSlideshow"}
	],
	components: [
		{kind: "moon.DataGridList", fit:true, name: "resultList", minWidth: 250, minHeight: 300, ontap: "itemSelected", components: [
			{kind: "moon.GridListImageItem", imageSizing: "cover", useSubCaption:false, centered:false, bindings: [
				{from: "model.title", to:"caption"},
				{from: "model.thumbnail", to:"source"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.set("$.resultList.collection", new flickr.Collection());
		enyo.FluxDispatcher.subscribe(this.app.store.id, enyo.bind(this, this.update));
	},
	search: function(inSender, inEvent) {
		enyo.FluxDispatcher.notify(this.app.store.id, {
			actionType: flickr.Constants.Actions.search,
			payload: {
				params : {
					method: "flickr.photos.search",
					sort: "interestingness-desc",
					per_page: 50,
					text: inEvent.originator.get("value")
				}
			}
		});
		this.$.spinner.setShowing(true);
	},
	update: function(data) {
		console.log("SearchPanel update");
		if (data && data.photos && data.photos.photo) {
			this.$.resultList.collection.empty({destroy:true});
			this.$.resultList.collection.add(data && data.photos && data.photos.photo);
			this.$.spinner.setShowing(false);
		}
		if (this.$.resultList.collection.length) {
			this.$.startButton.setShowing(true);
		} else {
			this.$.startButton.setShowing(false);
		}
	},
	itemSelected: function(inSender, inEvent) {
		this.$.resultList.collection.set("selected", inEvent.model);
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
	create: function() {
		this.inherited(arguments);
		if (this.model) {
			this.set("title", this.model.get("title"));
			this.set("$.image.src", this.model.get("original"));
			this.set("titleBelow", "By " + (this.model.get("username") || " unknown user"));
			this.set("$.qr.src", this.model.get("original") ? "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" + encodeURIComponent(this.model.get("original")) : "");
		}
	},
	requestFullScreen: function() {
		this.doRequestFullScreen({model: this.model});
	}
});
