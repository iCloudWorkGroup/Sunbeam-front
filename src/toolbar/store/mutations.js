import {
    SWITCH_NAME
} from './mutation-type'
export default {
    [SWITCH_NAME](state, name) {
        state.activeName = name
    },
    M_CHANGE_TOOL(state, obj) {
        state.toolShow.font = typeof obj.font !== 'undefined' ? obj.font : state.toolShow.font
        state.toolShow.align = typeof obj.align !== 'undefined' ? obj.align : state.toolShow.align
        state.toolShow.format = typeof obj.format !== 'undefined' ? obj.format : state.toolShow.format
        state.toolShow.frozen = typeof obj.frozen !== 'undefined' ? obj.frozen : state.toolShow.frozen
        state.toolShow.rowcol = typeof obj.rowcol !== 'undefined' ? obj.rowcol : state.toolShow.rowcol
        state.toolShow.hide = typeof obj.hide !== 'undefined' ? obj.hide : state.toolShow.hide
        state.toolShow.comment = typeof obj.comment !== 'undefined' ? obj.comment : state.toolShow.comment
    }
}