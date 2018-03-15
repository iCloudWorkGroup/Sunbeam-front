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
		request.setRequestHeader('excelId', '90a89fe2-8049-4d8d-a58e-795d34d4fdc4');
	}
	let success = options.success;
	options.success = function(data) {
		if (data.isLegal === false) {
			cache.sendQueueStep--;
		}
		success.apply(this, arguments);
	}

	$.ajax(options);
}