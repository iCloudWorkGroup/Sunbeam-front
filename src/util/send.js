import axios from 'axios';
import cfg from '../config';
import extend from './extend';
import cache from '../tools/cache';
import $ from 'jquery';

export default function(options) {
	if (options.isPublic) {
		cache.sendQueueStep++;
	}
	options = extend({}, {
		type: 'POST',
		async: true,
		baseURL: cfg.rootPath,
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		isPublic: true,
		headers: {
			'step': cache.sendQueueStep
		}
	}, options);

	options.url = cfg.rootPath + options.url;
	options.beforeSend = function(request) {
		request.setRequestHeader('step', cache.sendQueueStep);
		request.setRequestHeader('excelId', window.SPREADSHEET_AUTHENTIC_KEY);
	}
	let success = options.success;
	options.success = function(data) {
		if (data.isLegal === false) {
			cache.sendQueueStep--;
		}
		success.apply(this, arguments);
	}

	return $.ajax(options);
}