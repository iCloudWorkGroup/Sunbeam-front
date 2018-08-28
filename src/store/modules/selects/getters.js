export default {
    /**
     * 所有选中区域，部分类型
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    allSelects(state) {
        return state.list
    },
    selectState(state) {
        return state.selectState
    },
    getOprRegion(state, getters) {
        return function() {
            let wholePosi = state.list[0].wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)

            // 暂时不考虑整个表格全选中的情况
            let endColIndex
            if (wholePosi.endColAlias !== 'MAX') {
                endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            }
            let endRowIndex
            if ((endRowIndex = wholePosi.endColAlias) !== 'MAX') {
                endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
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
    },
    /**
     * 获取active的单元格信息
     * @return {[type]} [description]
     */
    activeCell(state){
        let activePosi = state.list[0].activePosi

    }
}