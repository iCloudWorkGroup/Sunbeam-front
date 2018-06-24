import Vue from 'vue'
import * as types from '../../mutation-types'
import extend from '../../../util/extend'

export default {
    [types.INSERT_SHEET](state, sheet) {
        Vue.set(state, sheet.alias, [])
    },
    [types.INSERT_CELL](state, {
        currentSheet,
        cell
    }) {
        let currentList = state[currentSheet]
        currentList.push(cell)
    },
    [types.UPDATE_CELL](state, info) {
        info.forEach(function({
            cell,
            props
        }) {
            extend(cell, props)
        })
    }
}