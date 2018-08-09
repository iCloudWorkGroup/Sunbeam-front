export default {
    getEidtState(state, getters, rootState) {
        return function() {
            let currentSheet = rootState.currentSheet
            return state[currentSheet].editState
        }
    },
    getInputState(state, getters, rootState) {
        return function() {
            let currentSheet = rootState.currentSheet
            return state[currentSheet]
        }
    }
}