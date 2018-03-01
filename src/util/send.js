import axios from 'axios';
import cfg from '../config';
import extend from './extend';
import cache from '../tools/cache';

export default function(options) {
	if (options.isPublic) {
		cache.sendQueueStep++;
	}
	options = extend({}, {
		method: 'post',
		baseURL: cfg.rootPath,
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		isPublic: true,
		headers: {
			'step': cache.sendQueueStep
		}
	}, options);
	return axios(options).then(function(response) {
		if (response.data.isLegal === false) {
			cache.sendQueueStep--;
		}
		options.success(response.data);
	});
}