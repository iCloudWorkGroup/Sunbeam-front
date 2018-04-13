
export default function extend(...values) {
	let target,
		options, clone, name,
		src, copy, i = 1;

	if (values.length === 1) {
		target = {};
		i = 0;
	} else {
		target = values[0];
	}

	for (let len = values.length; i < len; i++) {
		// Only deal with non-null/undefined values
		options = values[i];
		// Extend the base object
		for (name in options) {
			src = target[name];
			copy = options[name];

			// Prevent never-ending loop
			if (target === copy || copy === 'undefined') {
				continue;
			}

			if (isObject(copy)) {
				if (Array.isArray(copy)) {
					clone = src && Array.isArray(src) ? src : [];
				} else {
					clone = src && isObject(src) ? src : {};
				}
				target[name] = extend(clone, copy);
			} else {
				target[name] = copy;
			}
		}
	}
	return target;
}

function isObject(obj) {
	return typeof obj === 'object' && obj !== null;
}