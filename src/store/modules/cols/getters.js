import {
    rangeBinary,
    indexAttrBinary
} from '../../../util/binary'

export default {
    colList(state, getters, rootState) {
        return state[rootState.currentSheet].list
    },
    visibleColList(state, getters) {
        let list = getters.colList
        let result = []

        list.forEach(function(col) {
            if (!col.hidden) {
                result.push(col)
            }
        })
        return result
    },
    getColMaxPosi(state, getters) {
        let list = getters.visibleColList
        let lastCol = list[list.length - 1]
        return lastCol.left + lastCol.width
    },
    getColIndexByPosi(state, getters, rootState) {
        return function(posi) {
            let col = getters.getColByPosi(posi)
            return getters.getColIndexBySort(col.sort)
        }
    },
    getColByPosi(state, getters) {
        let visibleList = getters.visibleColList

        return function(posi) {
            let lastCol = visibleList[visibleList.length - 1]
            if (lastCol.left + lastCol.width < posi) {
                return lastCol
            }
            let index = rangeBinary(posi, visibleList, 'left', 'width')
            let col = visibleList[index]
            return col
        }
    },
    getVisibleColIndexBySort(state, getters, rootState) {
        let list = getters.visibleColList
        return function(sort) {
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getColIndexBySort(state, getters, rootState) {
        let list = getters.colList
        return function(sort) {
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getColIndexByAlias(state, getters, rootState) {
        return function(alias) {
            if (alias === 'MAX') {
                return 'MAX'
            }
            let col = getters.getColByAlias(alias)
            if (col) {
                return getters.getColIndexBySort(col.sort)
            }
            return -1
        }
    },
    getColByAlias(state, getters, rootState) {
        return function(alias) {
            let currentSheet = rootState.currentSheet
            let map = state[currentSheet].map
            return map.get(alias)
        }
    },
    userViewColList(state, getters, rootState) {
        let list = getters.colList
        let visibleList = getters.visibleColList
        let userView = rootState.userView
        let start = getters.getColIndexByPosi(userView.left)
        let end = getters.getColIndexByPosi(userView.right)

        start = indexAttrBinary(list[start].sort, visibleList, 'sort')
        end = indexAttrBinary(list[end].sort, visibleList, 'sort')

        return visibleList.slice(start, end + 1)
    },
    // getVisibleColList(state, getters) {
    //  return function(start, end){

    //      let list = getters.visibleColList,
    //          startIndex = indexAttrBinary(list[start].sort, visibleList, 'sort'),
    //          endIndex = indexAttrBinary(list[end].sort, visibleList, 'sort')

    //      return visibleList.slice(startIndex, endIndex)
    //  }
    // }
}