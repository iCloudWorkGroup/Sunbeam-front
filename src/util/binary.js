export function rangeBinary(val, arr, strandAttr, rangeAttr, startIndex, endIndex) {
	var middle,
		start = startIndex ? startIndex : 0,
		end = endIndex ? endIndex : arr.length,
		findVal = Math.floor(val),
		startVal, endVal,
		middleIndex,
		middle;
	while (start < end) {
		middleIndex = end + start >>> 1;
		middle = array[middleIndex];
		start = middle[strandAttr];
		end = middle[rangeAttr] + start;
		if (end < findValue) {
			start = middleIndex + 1;
		} else {
			end = middleIndex;
		}
	}
	return start;
}
export function indexAttrBinary(value, array, attr, startIndex, endIndex) {
	var middleIndex;

	startIndex = startIndex || 0;
	endIndex = endIndex || array.length - 1;
	if (array[startIndex][attr] > value) {
		return -1;
	}
	if (array[endIndex][attr] < value) {
		return -1;
	}
	while (startIndex < endIndex) {
		if (array[startIndex][attr] === value) {
			return startIndex;
		}
		if (array[endIndex][attr] === value) {
			return endIndex;
		}
		middleIndex = endIndex + startIndex >>> 1;
		if (array[middleIndex][attr] === value) {
			return middleIndex;
		} else if (array[middleIndex][attr] < value) {
			startIndex = middleIndex + 1;
		} else {
			endIndex = middleIndex;
		}
	}
	return -1;
}