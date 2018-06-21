import {
    rangeBinary,
    indexAttrBinary
} from '../../../util/binary'

export default {
    rowList(state, getters, rootState) {
        let currentSheet = rootState.currentSheet
        let result = state[currentSheet].list
        return result
    },
    visibleRowList(state, getters) {
        let list = getters.rowList
        let result = []

        list.forEach(function(row) {
            if (!row.hidden) {
                result.push(row)
            }
        })
        return result
    },
    getRowMaxPosi(state, getters) {
        let list = getters.visibleRowList
        let lastRow = list[list.length - 1]
        return lastRow.top + lastRow.height
    },
    getRowIndexByPosi(state, getters, rootState) {
        return function(posi) {
            let row = getters.getRowByPosi(posi)
            return getters.getRowIndexBySort(row.sort)
        }
    },
    getRowByPosi(state, getters) {
        let visibleList = getters.visibleRowList

        return function(posi) {
            let lastRow = visibleList[visibleList.length - 1]
            if (lastRow.top + lastRow.height < posi) {
                return lastRow
            }
            let index = rangeBinary(posi, visibleList, 'top', 'height')
            let row = visibleList[index]
            return row
        }
    },
    getVisibleRowIndexBySort(state, getters, rootState) {
        let list = getters.visibleRowList
        return function(sort) {
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getTempList(state, getters, rootState) {
        let list = getters.rowList
        return function() {
            return list.length
        }
    },
    getRowIndexBySort(state, getters, rootState) {
        let list = getters.rowList
        return function(sort) {
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getRowByAlias(state, getters, rootState) {
        return function(alias) {
            let currentSheet = rootState.currentSheet
            let map = state[currentSheet].map

            return map.get(alias)
        }
    },
    getRowIndexByAlias(state, getters, rootState) {
        return function(alias) {
            if (alias === 'MAX') {
                return 'MAX'
            }
            let row = getters.getRowByAlias(alias)
            if (row) {
                return getters.getRowIndexBySort(row.sort)
            }
            return -1
        }
    },
    userViewRowList(state, getters, rootState) {
        let list = getters.rowList
        let visibleList = getters.visibleRowList
        let userView = rootState.userView
        let start = getters.getRowIndexByPosi(userView.top)
        let end = getters.getRowIndexByPosi(userView.bottom)

        start = indexAttrBinary(list[start].sort, visibleList, 'sort')
        end = indexAttrBinary(list[end].sort, visibleList, 'sort')

        return visibleList.slice(start, end + 1)
    }
}