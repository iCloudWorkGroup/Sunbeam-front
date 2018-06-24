export function rangeBinary(val, array, strandAttr, rangeAttr,
    startArgs = 0, endArgs = array.length - 1) {
    let start = startArgs
    let end = endArgs
    let middle
    let findVal = Math.floor(val)
    let startVal
    let endVal
    let middleIndex

    while (start < end) {
        middleIndex = end + start >>> 1
        middle = array[middleIndex]
        startVal = middle[strandAttr]
        endVal = middle[rangeAttr] + startVal
        if (endVal < findVal) {
            start = middleIndex + 1
        } else {
            end = middleIndex
        }
    }
    return start
}
/**
 * [indexAttrBinary description]
 * @param  {[type]} value      [description]
 * @param  {[type]} array      [description]
 * @param  {[type]} attr       [description]
 * @param  {Number} startIndex [description]
 * @param  {[type]} endIndex   [description]
 * @return {[type]}            [description]
 */
export function indexAttrBinary(value, array, attr, startIndexArgs = 0,
    endIndexArgs = array.length - 1) {
    let startIndex = startIndexArgs
    let endIndex = endIndexArgs

    if (array.length === 0) {
        return -1
    }
    if (array[startIndex][attr] > value) {
        return startIndex
    }
    if (array[endIndex][attr] < value) {
        return endIndex + 1
    }
    while (startIndex < endIndex) {
        if (array[startIndex][attr] === value) {
            return startIndex
        }
        if (array[endIndex][attr] === value) {
            return endIndex
        }
        let middleIndex = endIndex + startIndex >>> 1
        if (array[middleIndex][attr] === value) {
            return middleIndex
        } else if (array[middleIndex][attr] < value) {
            startIndex = middleIndex + 1
        } else {
            endIndex = middleIndex
        }
    }
    return startIndex
}