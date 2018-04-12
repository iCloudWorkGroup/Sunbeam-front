export function rangeBinary(val, array, strandAttr, rangeAttr, 
	start = 0, end = array.length - 1) {
	let middle,
		findVal = Math.floor(val),
		startVal, endVal,
		middleIndex;

	while (start < end) {
		middleIndex = end + start >>> 1;
		middle = array[middleIndex];
		startVal = middle[strandAttr];
		endVal = middle[rangeAttr] + startVal;
		if (endVal < findVal) {
			start = middleIndex + 1;
		} else {
			end = middleIndex;
		}
	}
	return start;
}
export function indexAttrBinary(value, array, attr, startIndex = 0, 
	endIndex = array.length - 1) {
	let middleIndex;

	if (array[startIndex][attr] > value) {
		return startIndex;
	}
	if (array[endIndex][attr] < value) {
		return endIndex + 1;
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
	return startIndex;
}