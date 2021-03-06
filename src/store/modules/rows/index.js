import actions from './actions'
import mutations from './mutations'
import getters from './getters'

/**
 * 状态值
 * 结构为 state = {
    'sheetAlias' : list []
 }
 * list为row对象数组
 * @type {Object}
 */
// list: [rows]
const state = {}

export default {
    state,
    getters,
    actions,
    mutations
}