import axios from 'axios';
import cfg from '../config';
import cache from '../tools/cache';
import extend from './extend';

export default function(options) {
	options = extend({},{
		method: 'post',
		baseURL: cfg.rootPath,
		contentType: 'application/json; charset=UTF-8',
		dataType: 'json',
		async: false,
		isPublic: true
	}, options);
	axios(options).then(function(response){
		options.success(response.data);
	});
}