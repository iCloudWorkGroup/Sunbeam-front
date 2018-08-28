import * as types from '../../mutation-types'
import {
    indexAttrBinary
} from '../../../util/binary'
import extend from '../../../util/extend'

export default {
    /**
     * 添加列信息，只在最后面增加
     */
    [types.ADD_COL](state, payload) {
        let cols = payload.cols
        for (let i = 0, len = cols.length; i < len; i++) {
            let col = cols[i]
            state.list.push(col)
            state.map.set(col.alias, col)
        }
    },
    /**
     * 插入一些，可以在任何地方
     */
    [types.INSERT_COL](state, payload) {
        let cols = payload.cols
        let colState = state[payload.currentSheet]
        let list = colState.list
        let map = colState.map

        for (let i = 0, len = cols.length; i < len; i++) {
            let col = cols[i]
            let index = indexAttrBinary(col.sort, list, 'sort')
            list.splice(index, 0, col)
            map.set(col.alias, col)
        }
    },
    [types.CANCEL_ACTIVE_COL](state) {
        let list = state.list
        for (let i = 0, len = list.length; i < len; i++) {
            list[i].active = false
        }
    },
    [types.ACTIVE_COL](state, {
        startIndex,
        endIndex = startIndex
    }) {
        for (let i = startIndex; i <= endIndex; i++) {
            state.list[i].active = true
        }
    },
    [types.UPDATE_COL](state, info) {
        info.forEach(function({
            col,
            props
        }) {
            extend(col, props)
        })
    },
    [types.DELETE_COL](state, {
        currentSheet,
        index
    }) {
        let list = state[currentSheet].list
        let map = state[currentSheet].map
        map.delete(list[index].alias)
        list.splice(index, 1)
    },
    M_COLS_UPDATE_VIEW(state, {
        isView,
        startIdx,
        overIdx
    }) {
        for (let i = startIdx; i < overIdx + 1; i++) {
            state.list[i].visible = isView
        }
    }
}