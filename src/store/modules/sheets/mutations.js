import * as types from '../../mutation-types'
import extend from '../../../util/extend'

export default {
    [types.INSERT_SHEET](state, sheet) {
        state.list.push(sheet)
    },
    [types.UPDATE_FROZENSTATE](state, payload) {
        let list = state.list
        let currentSheet = payload.currentSheet
        let frozenState

        list.forEach(function(item) {
            if (item.alias === currentSheet) {
                frozenState = item.frozenState
            }
        })
        extend(frozenState, payload)
    },
    [types.UPDATE_OCCUPY](state, payload) {
        let list = state.list
        let currentSheet = payload.currentSheet
        let editViewOccupy

        list.forEach(function(item) {
            if (item.alias === currentSheet) {
                editViewOccupy = item.editViewOccupy[payload.type]
            }
        })
        let col = editViewOccupy.col
        let row = editViewOccupy.row

        if (payload.col) {
            col.splice(0, col.length, ...payload.col)
        }
        if (payload.row) {
            row.splice(0, row.length, ...payload.row)
        }
    },
    // 更新scrollTop, left的共享值
    UPDATE_SHEETS_SCROLL(state, {
        scrollTop,
        scrollLeft
    }) {
        let scroll = state.scroll
        if (scrollLeft != null &&
            scrollLeft !== scroll.left) {
            scroll.left = scrollLeft
        }
        if (scrollTop != null &&
            scrollTop !== scroll.top) {
            scroll.top = scrollTop
        }
    },
    /**
     * [M_SHEETS_ADD_LOADED description]
     * @param {[type]}  state             [description]
     * @param {[type]}  options.colAlias  [description]
     * @param {Boolean} options.colSupply [是否添加到数组中，避免数组重复]
     * @param {[type]}  options.rowAlias  [description]
     * @param {Boolean} options.rowSupply [description]
     */
    M_SHEETS_ADD_LOADED(state, {
        colAlias,
        colSupply = true,
        rowAlias,
        rowSupply = true
    }) {
        let loaded = state.loaded
        if (colSupply) {
            loaded.cols.push(colAlias)
        }
        if (rowSupply) {
            loaded.rows.push(rowAlias)
        }
        let colMap = loaded.colMap
        let rowItem = colMap.get(colAlias)
        if (rowItem == null) {
            colMap.set(colAlias, new Map().set(rowAlias, true))
        } else {
            rowItem.set(rowAlias, true)
        }

        let rowMap = loaded.rowMap
        let colItem = rowMap.get(rowAlias)
        if (colItem == null) {
            rowMap.set(rowAlias, new Map().set(colAlias, true))
        } else {
            colItem.set(colAlias, true)
        }
    },
    UPDATE_SHEETS_MAX(state, {
        rowAlias,
        colAlias,
        rowPixel,
        colPixel
    }) {
        let max = state.max
        max.rowAlias = rowAlias != null ? rowAlias : max.rowAlias
        max.colAlias = colAlias != null ? colAlias : max.colAlias
        max.rowPixel = rowPixel != null ? rowPixel : max.rowPixel
        max.colPixel = colPixel != null ? colPixel : max.colPixel
    }
}