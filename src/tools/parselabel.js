export default function(label, store, fn) {
    let select = store.state.selects.activeSelect
    let wholePosi = select.wholePosi
    let getters = store.getters
    let startRowIndex
    let startColIndex
    let endRowIndex
    let endColIndex

    if (!label) {
        startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
    } else {
        let {
            startColSort,
            startRowSort,
            endRowSort,
            endColSort
        } = parse(label)
        startColIndex = getters.getColIndexBySort(startColSort)
        endColIndex = getters.getColIndexBySort(endColSort)
        startRowIndex = getters.getRowIndexBySort(startRowSort)
        endRowIndex = getters.getRowIndexBySort(endRowSort)
    }

    fn({
        startColIndex,
        startRowIndex,
        endRowIndex,
        endColIndex
    })
}


function parse(label) {
    let temp
    let reg = /^[A-Z]+[1-9]+[0-9]*$/
    let startColSort
    let endColSort
    let startRowSort
    let endRowSort
    let startColDisplayName
    let startRowDisplayName
    let endColDisplayName
    let endRowDisplayName
    let regionLabel

    // 解析
    if (regionLabel instanceof Array) {
        // 判断数组长度
        if (regionLabel.length !== 2) {
            throw new Error('Parameter format error')
        }
        // 匹配数据格式
        if (!reg.test(regionLabel[0]) && !reg.test(regionLabel[1])) {
            throw new Error('Parameter format error')
        }

        startColDisplayName = getDisplayName(regionLabel[0], 'col')
        startRowDisplayName = getDisplayName(regionLabel[0], 'row')
        endColDisplayName = getDisplayName(regionLabel[1], 'col')
        endRowDisplayName = getDisplayName(regionLabel[1], 'row')

        startColSort = colSignToSort(startColDisplayName)
        endColSort = colSignToSort(endColDisplayName)
        startRowSort = rowSignToSort(startRowDisplayName)
        endRowSort = rowSignToSort(endRowDisplayName)

    } else if (/^[A-Z]+$/.test(regionLabel)) { // 整列操作
        startRowSort = 0
        endRowSort = 'MAX'
        startColSort = endColSort = colSignToSort(regionLabel)

    } else if (/^[1-9]+[0-9]*$/.test(regionLabel)) { // 整行操作
        startColSort = 0
        endColSort = 'MAX'
        startRowSort = endRowSort = rowSignToSort(regionLabel)

    } else if (reg.test(regionLabel)) {
        startRowDisplayName = getDisplayName(regionLabel, 'row')
        startColDisplayName = getDisplayName(regionLabel, 'col')
        startColSort = endColSort = colSignToSort(startColDisplayName)
        startRowSort = endRowSort = rowSignToSort(startRowDisplayName)
    } else {
        throw new Error('Parameter format error')
    }
    // 交换位置

    if (startRowSort > endRowSort && endRowSort !== 'MAX') {
        temp = startRowSort
        startRowSort = endRowSort
        endRowSort = temp
    }
    if (startColSort > endColSort && endColSort !== 'MAX') {
        temp = startColSort
        startColSort = endRowSort
        endRowSort = temp
    }
    return {
        startRowSort: startRowSort,
        endRowSort: endRowSort,
        startColSort: startColSort,
        endColSort: endColSort
    }

    function getDisplayName(regionLabel, lineType) {
        let result = ''
        let len = 0
        if (/[A-Z]/i.test(regionLabel)) {
            len = regionLabel.match(/[A-Z]/ig).length
        }
        if (lineType === 'col') {
            result = regionLabel.substring(0, len)
        } else if (lineType === 'row') {
            result = regionLabel.substring(len)
        }
        return result
    }

    function colSignToSort(sign) {
        let i = 0
        let sort = 0
        let len = sign.length
        let letter
        let index

        letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
            'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ]

        if (sign === 'MAX') {
            return 'MAX'
        }
        for (; i < len; i++) {
            index = letter.indexOf(sign[i]) + 1
            sort += index * (Math.pow(26, (len - i - 1)))
        }
        return sort - 1
    }

    function rowSignToSort(sign) {
        if (sign === 'MAX') {
            return 'MAX'
        }
        return parseInt(sign, 10) - 1
    }
}