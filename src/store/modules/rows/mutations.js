import {
    ADD_ROW,
    INSERT_ROW,
    ACTIVE_ROW,
    CANCEL_ACTIVE_ROW,
    UPDATE_ROW,
    DELETE_ROW
} from '../../mutation-types'
import {
    indexAttrBinary
} from '../../../util/binary'
import extend from '../../../util/extend'

export default {
    [ADD_ROW](state, payload) {
        let rows = payload.rows
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            state.list.push(row)
            state.map.set(row.alias, row)
        }
    },
    [INSERT_ROW](state, payload) {
        let rows = payload.rows
        let list = state.list
        let map = state.map
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            let index = indexAttrBinary(row.sort, list, 'sort')
            list.splice(index, 0, row)
            map.set(row.alias, row)
        }
    },
    [CANCEL_ACTIVE_ROW](state) {
        let list = state.list
        for (let i = 0, len = list.length; i < len; i++) {
            list[i].active = false
        }
    },
    [ACTIVE_ROW](state, {
        startIndex,
        endIndex = startIndex
    }) {
        for (let j = startIndex; j <= endIndex; j++) {
            state.list[j].active = true
        }
    },
    [UPDATE_ROW](state, info) {
        info.forEach(function({
            row,
            props
        }) {
            state.list[row.sort] = extend(true, row, props)
        })
    },
    [DELETE_ROW](state, {
        index
    }) {
        let list = state.list
        list.splice(index, 1)
    },
    M_ROWS_UPDATE_VIEW(state, {
        isView,
        startIdx,
        overIdx
    }) {
        for (let i = startIdx; i < overIdx + 1; i++) {
            state.list[i].visible = isView
        }
    },
    M_CLEAR_ROWS(state) {
        state.list = []
        state.map = new Map()
    }
}