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
    }
}