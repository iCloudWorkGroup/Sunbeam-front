import mutations from './mutations'
import actions from './actions'
import getters from './getters'

const state = {
    /**
     * sheet列表
     * @type {Array}
     */
    list: []
}

export default {
    state,
    actions,
    mutations,
    getters
}