export default {
    selectList(state, getters, rootState) {
        return state[rootState.currentSheet].list
    },
    activeSelect(state) {
        return state.activeSelect
    },
    getOprRegion(state, getters) {
        let select = getters.activeSelect
        let wholePosi = select.wholePosi
        let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)

        let fullRegion = getters.getFullOprRegion({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })
        startColIndex = fullRegion.startColIndex
        startRowIndex = fullRegion.startRowIndex
        endColIndex = fullRegion.endColIndex
        endRowIndex = fullRegion.endRowIndex
        return {
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        }
    }
}