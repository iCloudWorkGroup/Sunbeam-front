export default {
    inputProps(state, getters, rootState) {
        return state.box
    },
    inputStatus(state, getters, rootState) {
        return state.editStatus
    }
}