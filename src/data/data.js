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
