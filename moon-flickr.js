(function (scope, bundled) {
	
	var   enyo     = scope.enyo || (scope.enyo = {})
		, manifest = enyo.__manifest__ || (defineProperty(enyo, '__manifest__', {value: {}}) && enyo.__manifest__)
		, exported = enyo.__exported__ || (defineProperty(enyo, '__exported__', {value: {}}) && enyo.__exported__)
		, require  = enyo.require || (defineProperty(enyo, 'require', {value: enyoRequire}) && enyo.require)
		, local    = bundled()
		, entries;

	// below is where the generated entries list will be assigned if there is one
	entries = ['index'];


	if (local) {
		Object.keys(local).forEach(function (name) {
			var value = local[name];
			if (manifest.hasOwnProperty(name)) {
				if (!value || !(value instanceof Array)) return;
			}
			manifest[name] = value;
		});
	}

	function defineProperty (o, p, d) {
		if (Object.defineProperty) return Object.defineProperty(o, p, d);
		o[p] = d.value;
		return o;
	}
	
	function enyoRequire (target) {
		if (!target || typeof target != 'string') return undefined;
		if (exported.hasOwnProperty(target))      return exported[target];
		var   request = enyo.request
			, entry   = manifest[target]
			, exec
			, map
			, ctx
			, reqs
			, reqr;
		if (!entry) throw new Error('Could not find module "' + target + '"');
		if (!(entry instanceof Array)) {
			if (typeof entry == 'object' && (entry.source || entry.style)) {
				throw new Error('Attempt to require an asynchronous module "' + target + '"');
			} else if (typeof entry == 'string') {
				throw new Error('Attempt to require a bundle entry "' + target + '"');
			} else {
				throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
			}
		}
		exec = entry[0];
		map  = entry[1];
		if (typeof exec != 'function') throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
		ctx  = {exports: {}};
		if (request) {
			if (map) {
				reqs = function (name) {
					return request(map.hasOwnProperty(name) ? map[name] : name);
				};
				defineProperty(reqs, 'isRequest', {value: request.isRequest});
			} else reqs = request;
		}
		reqr = !map ? require : function (name) {
			return require(map.hasOwnProperty(name) ? map[name] : name);
		};
		exec(
			ctx,
			ctx.exports,
			scope,
			reqr,
			reqs
		);
		return exported[target] = ctx.exports;
	}

	// in occassions where requests api are being used, below this comment that implementation will
	// be injected
	

	// if there are entries go ahead and execute them
	if (entries && entries.forEach) entries.forEach(function (name) { require(name); });
})(this, function () {
	// this allows us to protect the scope of the modules from the wrapper/env code
	return {'src/data':[function (module,exports,global,require,request){
/**
	For simple applications, you might define all of your models, collections,
	and sources in this file.  For more complex applications, you might choose to separate
	these kind definitions into multiple files under this folder.
*/

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	JsonpSource = require('enyo/JsonpSource'),
	Model = require('enyo/Model'),
	Collection = require('enyo/Collection');

var Source = kind({
	name: 'flickr.Source',
	kind: JsonpSource,
	urlRoot: 'https://api.flickr.com/services/rest/',
	fetch: function (rec, opts) {
		opts.callbackName = 'jsoncallback';
		opts.params = utils.clone(rec.params);
		opts.params.api_key = '2a21b46e58d207e4888e1ece0cb149a5';
		opts.params.format = 'json';
		this.inherited(arguments);
	}
});

new Source({name: 'flickr'});

var ImageModel = kind({
	name: 'flickr.ImageModel',
	kind: Model,
	options: { parse: true },
	source: 'flickr',
	computed: [
		{method: 'thumbnail', path: ['farm', 'server', 'id', 'secret']},
		{method: 'original', path: ['farm', 'server', 'id', 'secret']}
	],
	thumbnail: function () {
		return 'https://farm' + this.get('farm') +
			'.static.flickr.com/' + this.get('server') +
			'/' + this.get('id') + '_' + this.get('secret') + '_m.jpg';
	},
	original: function () {
		return 'https://farm' + this.get('farm') +
			'.static.flickr.com/' + this.get('server') +
			'/' + this.get('id') + '_' + this.get('secret') + '.jpg';
	},
	fetch: function (opts) {
		this.params = {
			method: 'flickr.photos.getinfo',
			photo_id: this.get('id')
		};
		return this.inherited(arguments);
	},
	parse: function (data) {
		data = data.photo || data;
		data.title = data.title._content || data.title;
		data.username = data.owner && data.owner.realname;
		data.taken = data.dates && data.dates.taken;
		return data;
	}
});

var SearchCollection = kind({
	name: 'flickr.SearchCollection',
	kind: Collection,
	model: ImageModel,
	source: 'flickr',
	options: { parse: true },
	published: {
		searchText: null
	},
	searchTextChanged: function () {
		this.empty({destroy: true});
		this.fetch();
	},
	fetch: function (opts) {
		this.params = {
			method: 'flickr.photos.search',
			sort: 'interestingness-desc',
			per_page: 50,
			text: this.searchText
		};
		return this.inherited(arguments);
	},
	parse: function (data) {
		return data && data.photos && data.photos.photo;
	}
});

module.exports = {
     Source: Source,
     ImageModel: ImageModel,
     SearchCollection: SearchCollection
 };

}],'src/views/views':[function (module,exports,global,require,request){
/**
	For simple applications, you might define all of your views in this file.  
	For more complex applications, you might choose to separate these kind definitions 
	into multiple files under this folder.
*/

var 
	kind = require('enyo/kind'),

	Image = require('enyo/Image'),
	ImageView = require('layout/ImageView'),
	FittableLayout = require('layout/FittableLayout'),
	FittableColumnsLayout = FittableLayout.Columns,

	Panels = require('moonstone/Panels'),
	Panel = require('moonstone/Panel'),
	ContextualPopup = require('moonstone/ContextualPopup'),
	ContextualPopupButton = require('moonstone/ContextualPopupButton'),
	ContextualPopupDecorator = require('moonstone/ContextualPopupDecorator'),
	Spinner = require('moonstone/Spinner'),
	Button = require('moonstone/Button'),
	MoonImage = require('moonstone/Image'),
	DataGridList = require('moonstone/DataGridList'),
	GridListImageItem = require('moonstone/GridListImageItem');

var
	data = require('../data');

var Slideshow = kind({
	name: 'Slideshow',
	kind: ImageView,
	src: 'assets/splash.png',
	published: {
		photos: null,
		delay: 3000
	},
	index: 0,
	start: function () {
		this.next(true);
	},
	next: function (start) {
		if (!start) {
			this.index++;
			if (this.index >= this.photos.length) {
				this.index = 0;
			}
		}
		this.set('src', this.photos.at(this.index).get('original'));
		this.startJob('slideshow', 'next', this.delay);
	},
	stop: function () {
		this.stopJob('slideshow');
		this.set('src', 'assets/splash.png');
	}
});

var DetailPanel = kind({
	name: 'DetailPanel',
	kind: Panel,
	events: {
		onRequestFullScreen: ''
	},
	layoutKind: FittableColumnsLayout,
	components: [
		{kind: MoonImage, name: 'image', fit: true, sizing: 'contain', ontap: 'requestFullScreen'}
	],
	headerComponents: [
		{kind: Button, ontap: 'requestFullScreen', small: true, content: 'View Fullscreen'},
		{kind: ContextualPopupDecorator, components: [
			{kind: ContextualPopupButton, small: true, content: 'QR Code'},
			{kind: ContextualPopup, components: [
				{kind: Image, name: 'qr', style: 'height: 300px; width: 300px;'}
			]}
		]}
	],
	bindings: [
		{from: 'model.title', to: 'title'},
		{from: 'model.original', to: '$.image.src'},
		{from: 'model.username', to: 'titleBelow', transform: function (val) {
			return 'By ' + (val || ' unknown user');
		}},
		{from: 'model.taken', to: 'subTitleBelow', transform: function (val) {
			return val ? 'Taken ' + val : '';
		}},
		{from: 'model.original', to: '$.qr.src', transform: function (val) {
			return val ? 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(val) : '';
		}}
	],
	transitionFinished: function (inInfo) {
		if (inInfo.from < inInfo.to) {
			this.model.fetch();
		}
	},
	requestFullScreen: function () {
		this.doRequestFullScreen({model: this.model});
	}
});

var SearchPanel = kind({
	name: 'SearchPanel',
	kind: Panel,
	published: {
		photos: null
	},
	events: {
		onRequestPushPanel: '',
		onRequestSlideshowStart: ''
	},
	handlers: {
		onInputHeaderChange: 'search'
	},
	title: 'Search Flickr',
	titleBelow: 'Enter search term above',
	headerOptions: {inputMode: true, dismissOnEnter: true},
	headerComponents: [
		{kind: Spinner, content: 'Loading...', name: 'spinner'},
		{kind: Button, small: true, name: 'startButton', content: 'Start Slideshow', ontap: 'startSlideshow'}
	],
	components: [
		{kind: DataGridList, fit: true, name: 'resultList', minWidth: 250, minHeight: 300, ontap: 'itemSelected', components: [
			{kind: GridListImageItem, imageSizing: 'cover', useSubCaption: false, centered: false, bindings: [
				{from: 'model.title', to: 'caption'},
				{from: 'model.thumbnail', to: 'source'}
			]}
		]}
	],
	bindings: [
		{from: 'photos', to: '$.resultList.collection'},
		{from: 'photos.status', to: '$.spinner.showing', transform: function (value) {
			return this.photos.isBusy();
		}},
		{from: 'photos.length', to: '$.startButton.showing'}
	],
	search: function (sender, ev) {
		this.$.resultList.collection.set('searchText', ev.originator.get('value'));
	},
	itemSelected: function (sender, ev) {
		this.photos.set('selected', ev.model);
		this.doRequestPushPanel({panel: {kind: DetailPanel, model: ev.model}});
	},
	startSlideshow: function () {
		this.doRequestSlideshowStart();
	}
});

var MainView = kind({
	name: 'MainView',
	classes: 'moon enyo-fit',
	handlers: {
		onRequestPushPanel: 'pushPanel',
		onRequestFullScreen: 'fullscreen',
		onRequestSlideshowStart: 'startSlideshow'
	},
	components: [
		{kind: Slideshow, classes: 'enyo-fit', src: 'assets/splash.png'},
		{kind: Panels, classes: 'enyo-fit', pattern: 'alwaysviewing', popOnBack: true, components: [
			{kind: SearchPanel}
		]}
	],
	bindings: [
		{from: '$.panels.showing', to: 'panelsShowing'}
	],
	create: function () {
		this.inherited(arguments);
		this.set('photos', new data.SearchCollection());
		this.$.searchPanel.set('photos', this.photos);
		this.$.slideshow.set('photos', this.photos);
	},
	pushPanel: function (sender, ev) {
		this.$.panels.pushPanel(ev.panel);
	},
	fullscreen: function (sender, ev) {
		this.$.slideshow.set('src', ev.model.get('original'));
		this.$.panels.hide();
	},
	startSlideshow: function () {
		this.$.slideshow.start();
		this.$.panels.hide();
	},
	panelsShowingChanged: function () {
		if (this.panelsShowing) {
			this.$.slideshow.stop();
		}
	}
});

module.exports = MainView;

},{'../data':'src/data'}],'index':[function (module,exports,global,require,request){
/**
	Define and instantiate your Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to ready().
*/

var
	kind = require('enyo/kind'),
	ready = require('enyo/ready'),
	view = require('./src/views/views.js');

var
	Application = require('enyo/Application');

var MyApp = module.exports = kind({
	name: 'Flickr.Application',
	kind: Application,
	view: view
});

ready(function () {
	new MyApp({name: 'app'});
});

},{'./src/views/views.js':'src/views/views'}]
	};

});
//# sourceMappingURL=moon-flickr.js.map