import {
    rangeBinary,
    indexAttrBinary
} from '../../../util/binary'

export default {
    allRows(state) {
        return state.list
    },
    visibleRowList(state, getters) {
        return function() {
            return state.list.filter(function(row) {
                return !row.hidden && row.visible
            })
        }
    },
    /**
     * 很多地方都需要进行offsetTop计算，
     * 所以方法进行提取
     */
    offsetTop(state, getters) {
        return function(start, over) {
            let overRow = getters.getRowByAlias(over)
            let rows = state.list
            let lastRow = rows[rows.length - 1]
            if (lastRow.alias === overRow.alias) {
                return getters.getRowByAlias(start).top
            }
            return 0
        }
    },
    /**
     * 返回区间内的所有行
     * 因为涉及到冻结的情况，所以数据过滤的时候需要进行双重过滤
     * 1. 通过范围和可视区域比较，确定应该返回的数据范围
     * 2. 再次过滤掉不可视的数据，返回最终的数据
     * @param  {[type]} state   [description]
     * @param  {[type]} getters [description]
     * @return {[type]}         [description]
     */
    rowsByRange(state, getters) {
        return function(beginAlias, endAlias) {
            let beginIdx = getters.rowIndexByAlias(beginAlias)
            let endIdx = getters.rowIndexByAlias(endAlias)
            if (beginIdx !== -1 && endIdx !== -1) {
                let visibleRows = this.visibleRowList()
                beginIdx = Math.max(visibleRows[0].sort, beginIdx)
                endIdx = Math.min(visibleRows[visibleRows.length - 1].sort, endIdx)

                // 因为索引总是 -1，所以结束要 +1
                return state.list.slice(beginIdx, endIdx + 1).filter(cell => {
                    return cell.visible === true
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
    neighborRowByAlias(state, getters) {
        return function(alias, toward) {
            let idx = getters.rowIndexByAlias(alias)
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
    getRowMaxPosi(state, getters) {
        return function() {
            let list = getters.visibleRowList()
            let lastRow = list[list.length - 1]
            return lastRow.top + lastRow.height
        }
    },
    getRowIndexByPosi(state, getters, rootState) {
        return function(posi) {
            let row = getters.getRowByPosi(posi)
            return getters.getRowIndexBySort(row.sort)
        }
    },
    getRowByIndex(state) {
        return function(idx) {
            return state.list[idx]
        }
    },
    getRowByPosi(state, getters) {
        return function(posi) {
            let visibleList = getters.visibleRowList()
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
        return function(sort) {
            let list = getters.visibleRowList()
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getTempList(state, getters, rootState) {
        return function() {
            let list = getters.allRows
            return list.length
        }
    },
    getRowIndexBySort(state, getters, rootState) {
        return function(sort) {
            let list = getters.allRows
            return indexAttrBinary(sort, list, 'sort')
        }
    },
    getRowByAlias(state, getters, rootState) {
        return function(alias) {
            return state.map.get(alias)
        }
    },
    rowIndexByAlias(state, getters, rootState) {
        return function(alias) {
            let row = getters.getRowByAlias(alias)
            if (row) {
                return getters.getRowIndexBySort(row.sort)
            }
            return -1
        }
    },
    userViewRowList(state, getters, rootState) {
        return function() {
            let list = getters.allRows
            let visibleList = getters.visibleRowList()
            let userView = rootState.userView
            let start = getters.getRowIndexByPosi(userView.top)
            let end = getters.getRowIndexByPosi(userView.bottom)

            start = indexAttrBinary(list[start].sort, visibleList, 'sort')
            end = indexAttrBinary(list[end].sort, visibleList, 'sort')

            return visibleList.slice(start, end + 1)
        }
    }
}