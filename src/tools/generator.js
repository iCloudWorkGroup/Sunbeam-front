import cache from './cache';

export function rowAliasGenerator() {
	return generator('row');
}
export function colAliasGenerator() {
	return generator('row');
}

function generator(type) {
	var alias,
		num;
	if (type === 'col') {
		alias = cache.aliasColCounter;
	} else {
		alias = cache.aliasRowCounter;
	}

	num = parseInt(alias);
	alias = (num + 1).toString();
	if (type === 'col') {
		cache.aliasColCounter = alias;
	} else {
		cache.aliasRowCounter = alias;
	}
	return alias;
}