import Vue from 'vue'
import * as types from '../../mutation-types'
import extend from '../../../util/extend'

export default {
    [types.INSERT_SHEET](state, sheet) {
        Vue.set(state, sheet.alias, {
            list: [],
            state: ''
        })
    },
    [types.INSERT_SELECT](state, payload) {
        let selects = payload.selects
        let list = state[payload.currentSheet].list

        for (let i = 0, len = selects.length; i < len; i++) {
            list.push(selects[i])
        }
    },
    [types.SWITCH_ACTIVESELECT](state, payload) {
        state.activeSelect = payload.select
    },
    [types.UPDATE_SELECT](state, info) {
        info.forEach(function({
            select,
            props
        }) {
            extend(select, props)
        })
    }
}