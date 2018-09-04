import actions from './actions'
import mutations from './mutations'
import getters from './getters'
/**
 * 状态值
 * 结构为 state = {'sheetAlias' : {list [], state}}
 * list为select对象数组
 * @type {Object}
 */
const state = {
    /**
     * 选中区域表
     * @type {Object}
     */
    list: [],
    selectState: 'SELECT'
}
export default {
    state,
    getters,
    actions,
    mutations
}