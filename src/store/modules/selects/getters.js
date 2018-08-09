export default {
    /**
     * 所有选中区域，部分类型
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    allSelects(state) {
        return state.list
    },
    getOprRegion(state, getters) {
        return function() {
            let wholePosi = state.activeSelect.wholePosi
            let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)

            // 暂时不考虑整个表格全选中的情况
            let endColIndex
            if (wholePosi.endColAlias !== 'MAX') {
                endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            }
            let endRowIndex
            if ((endRowIndex = wholePosi.endColAlias) !== 'MAX') {
                endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
            }
            if (endRowIndex === 'MAX' || endColIndex === 'MAX') {
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
            }
            return {
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            }
        }
    }
}