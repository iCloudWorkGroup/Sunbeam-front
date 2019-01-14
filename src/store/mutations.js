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
    },
    M_SET_CLICK_FLAG(state, obj) {
        state.oprclick.deleteColFlag = typeof obj.deleteColFlag !== 'undefined' ? obj.deleteColFlag : state.oprclick.deleteColFlag
        state.oprclick.deleteRowFlag = typeof obj.deleteRowFlag !== 'undefined' ? obj.deleteRowFlag : state.oprclick.deleteRowFlag
        state.oprclick.insertColFlag = typeof obj.insertColFlag !== 'undefined' ? obj.insertColFlag : state.oprclick.insertColFlag
        state.oprclick.insertRowFlag = typeof obj.insertRowFlag !== 'undefined' ? obj.insertRowFlag : state.oprclick.insertRowFlag
        state.oprclick.hideColFlag = typeof obj.hideColFlag !== 'undefined' ? obj.hideColFlag : state.oprclick.hideColFlag
        state.oprclick.hideRowFlag = typeof obj.hideRowFlag !== 'undefined' ? obj.hideRowFlag : state.oprclick.hideRowFlag
        state.oprclick.showColFlag = typeof obj.showColFlag !== 'undefined' ? obj.showColFlag : state.oprclick.showColFlag
        state.oprclick.showRowFlag = typeof obj.showRowFlag !== 'undefined' ? obj.showRowFlag : state.oprclick.showRowFlag
        state.oprclick.mergeFlag = typeof obj.mergeFlag !== 'undefined' ? obj.mergeFlag : state.oprclick.mergeFlag
    },
}