import mutations from './mutations'
import getters from './getters'
const state = {
    activeName: null,
    toolShow: {
        font: true,
        align: true,
        format: true,
        frozen: true,
        rowcol: true,
        hide: true,
        comment: true,
        validation: true,
    }
}
export default {
    state,
    getters,
    mutations
}