import {
    rangeBinary,
    indexAttrBinary
} from '../../../util/binary'

export default {
    /**
     * 所有列
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    allCols(state) {
        return state.list
    },
    /**
     * 可视区域的列
     * @param  {[type]} state   [description]
     * @param  {[type]} getters [description]
     * @return {[type]}         [description]
     */
    visibleColList(state, getters) {
        return function() {
            return state.list.filter(function(col) {
                return !col.hidden && col.visible
            })
        }
    },
    /**
     * 因为需要的地方比较多，所以进行抽象提取
     */
    offsetLeft(state, getters) {
        return function(start, over) {
            let userView = getters.userView()
            let overCol = getters.getColByAlias(over)
            let cols = state.list
            let lastCol = cols[cols.length - 1]
            if (lastCol.alias === overCol.alias) {
                return getters.getColByAlias(start).left
            }
            return userView.left
        }
    },
    /**
     * 根据alias的范围，查找列对象组
     * @param  {[type]} state   [description]
     * @param  {[type]} getters [description]
     * @return {[type]}         [description]
     */
    colsByRange(state, getters) {
        return function(beginAlias, endAlias) {
            let beginIdx = getters.colIndexByAlias(beginAlias)
            let endIdx = getters.colIndexByAlias(endAlias)
            if (beginIdx !== -1 && endIdx !== -1) {
                let visibleCols = this.visibleColList()
                beginIdx = Math.max(visibleCols[0].sort, beginIdx)
                endIdx = Math.min(visibleCols[visibleCols.length - 1].sort, endIdx)
                // 因为索引总是 -1，所以结束要 +1
                return state.list.slice(beginIdx, endIdx + 1).filter(col => {
                    return col.visible === true && col.hidden === false
                })
            }
            return null
        }
    },
    /**
     * 查找临近的列对象
     * @param  {[type]} state   [description]
     * @param  {[type]} getters [description]
     * @return {[type]}         [description]
     */
    neighborColByAlias(state, getters) {
        return function(alias, toward) {
            let idx = getters.colIndexByAlias(alias)
            switch (toward) {
                case 'PRE':
                    if (idx > 0) {
                        return state.list[--idx]
                    }
                    return null
                case 'NEXT':
                    if (idx < state.list.length - 1) {
                        return state.list[++idx]
                    }
                    return null
            }
        }
    },
    getColMaxPosi(state, getters) {
        return function() {
            let list = getters.visibleColList()
            let lastCol = list[list.length - 1]
            return lastCol.left + lastCol.width
        }
    },
    getColIndexByPosi(state, getters, rootState) {
        return function(posi) {
            let col = getters.getColByPosi(posi)
            return getters.getColIndexBySort(col.sort)
        }
    },
    /**
     * 根据索引查找对象，为了写法方便
     * 没有计算的意义
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    getColByIndex(state) {
        return function(idx) {
            return state.list[idx]
        }
    },
    getColByPosi(state, getters) {
        return function(posi) {
            let visibleList = getters.visibleColList()
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
        return function(sort) {
            let list = getters.visibleColList()
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    colIndexByAlias(state, getters) {
        return function(alias) {
            let col = getters.getColByAlias(alias)
            if (col) {
                return getters.getColIndexBySort(col.sort)
            }
            return -1
        }
    },
    getColByAlias(state, getters, rootState) {
        return function(alias) {
            return state.map.get(alias)
        }
    },
    getColIndexBySort(state, getters) {
        return function(sort) {
            return indexAttrBinary(sort, getters.allCols, 'sort')
        }
    },
    userViewColList(state, getters, rootState) {
        return function() {
            let cols = getters.allCols
            let visibleList = getters.visibleColList()
            let userView = rootState.userView
            let start = getters.getColIndexByPosi(userView.left)
            let end = getters.getColIndexByPosi(userView.right)

            start = indexAttrBinary(cols[start].sort, visibleList, 'sort')
            end = indexAttrBinary(cols[end].sort, visibleList, 'sort')

            return visibleList.slice(start, end + 1)
        }
    }
}