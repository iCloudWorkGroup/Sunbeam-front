import axios from 'axios';
import cfg from '../config';
import extend from './extend';
import cache from '../tools/cache';
import $ from 'jquery';

export default function(options) {
	if (options.isPublic === undefined || options.isPublic) {
		cache.sendQueueStep++;
	}
	options = extend({}, {
		type: 'POST',
		async: true,
		baseURL: cfg.rootPath,
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json'
	}, options);

	options.url = cfg.rootPath + options.url;
	options.beforeSend = function(request) {
		request.setRequestHeader('X-Step', cache.sendQueueStep);
		request.setRequestHeader('X-Book-Id', window.SPREADSHEET_AUTHENTIC_KEY);
	}
	let success = options.success;
	options.success = function(data) {
		if (data && data.isLegal === false) {
			cache.sendQueueStep--;
		}
		success.apply(this, arguments);
	}
	return $.ajax(options);
}