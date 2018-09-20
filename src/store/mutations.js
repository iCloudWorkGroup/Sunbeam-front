import {
    UPDATE_ACTIVESHEET
} from './mutation-types'

export default {
    [UPDATE_ACTIVESHEET](state, alias) {
        state.currentSheet = alias
    },
    M_UPDATE_LOAD(state, bool) {
        state.loading = bool
    },
    M_SET_CLASS(state, rootSelector) {
        state.rootSelector = rootSelector
    },
    M_SET_TOOLBAR_CLASS(state, toolbarSelector) {
        state.toolbarSelector = toolbarSelector
    }
}