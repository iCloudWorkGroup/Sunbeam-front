import getters from './getters'
import actions from './actions'
import mutations from './mutations'

/**
 * 选中区域状态值
 */
const state = {
    box: null,
    editStatus: 'EDIT'
}

export default {
    state,
    getters,
    actions,
    mutations
}