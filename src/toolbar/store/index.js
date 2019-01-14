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
        comment: false,
        validation: true,
        btn: false
    }
}
export default {
    state,
    getters,
    mutations
}