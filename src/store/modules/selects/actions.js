import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import * as actionTypes from '../../action-types'
import generator from '../../../tools/generator'
import template from './template'
import {
    SELECT,
    LOCATE,
    DRAG
} from '../../../tools/constant'
import {
    indexAttrBinary
} from '../../../util/binary'


export default {
    /**
     * 初始化选中区域
     */
    [actionTypes.SELECTS_INITSELECT]({
        state,
        getters,
        commit,
        rootState,
        rootGetters
    }) {
        let currentSheet = rootState.currentSheet
        let rows = getters.rowList
        let cols = getters.colList
        let visibleRows = getters.visibleRowList
        let visibleCols = getters.visibleColList
        let select = extend(template)
        let region
        let width
        let height
        let col = visibleCols[0]
        let row = visibleRows[0]

        region = getters.getFullOprRegion({
            startColIndex: getters.getColIndexByAlias(col.alias),
            startRowIndex: getters.getRowIndexByAlias(row.alias)
        })
        let { startColIndex, startRowIndex, endColIndex, endRowIndex } = region

        width = cols[endColIndex].width + cols[endColIndex].left - cols[
            startColIndex].left
        height = rows[endRowIndex].height + rows[endRowIndex].top - rows[
            startRowIndex].top

        select.physicsBox = {
            top: rows[startRowIndex].top,
            left: cols[startColIndex].left,
            width: width,
            height: height
        }
        select.wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex].alias,
            endRowAlias: rows[endRowIndex].alias
        }
        select.alias = generator.selectAliasGenerator()
        commit(mutationTypes.INSERT_SELECT, {
            currentSheet,
            selects: [select]
        })
        commit(mutationTypes.SWITCH_ACTIVESELECT, {
            select: getters.selectList[0]
        })
        commit(mutationTypes.ACTIVE_COL, {
            currentSheet,
            startIndex: startColIndex,
            endIndex: endColIndex
        })
        commit(mutationTypes.ACTIVE_ROW, {
            currentSheet,
            startIndex: startRowIndex,
            endIndex: endRowIndex
        })
    },
    /**
     * 更新选中区域
     */
    [actionTypes.SELECTS_UPDATESELECT]({
        state,
        getters,
        commit,
        rootState,
        dispatch
    }, payload) {
        let { startColIndex, startRowIndex, endRowIndex, endColIndex } = payload
        let rows = getters.rowList
        let cols = getters.colList
        let select = {}
        let activeSelect = state.activeSelect
        let region
        let mouseState = rootState.mouseState
        if (typeof endRowIndex === 'undefined' && mouseState === DRAG) {
            let tempPosi = activeSelect.tempPosi
            let wholePosi = activeSelect.wholePosi
            endColIndex = startColIndex
            endRowIndex = startRowIndex
            if (wholePosi.endColAlias === 'MAX') {
                startColIndex = 'MAX'
                startRowIndex = startRowIndex === 'MAX' ? 0 : startRowIndex
            }

            if (wholePosi.endRowAlias === 'MAX') {
                startRowIndex = 'MAX'
                startColIndex = startColIndex === 'MAX' ? 0 : startColIndex
            }
            startColIndex = indexAttrBinary(tempPosi.initColSort,
                cols, 'sort')
            startRowIndex = indexAttrBinary(tempPosi.initRowSort,
                rows, 'sort')
        }
        region = getters.getFullOprRegion({
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        })
        startColIndex = region.startColIndex
        startRowIndex = region.startRowIndex
        endColIndex = region.endColIndex
        endRowIndex = region.endRowIndex
        while (cols[startColIndex].hidden) {
            startColIndex++
        }
        while (rows[startRowIndex].hidden) {
            startRowIndex++
        }
        while (endColIndex !== 'MAX' && cols[endColIndex].hidden) {
            endColIndex--
        }
        while (endRowIndex !== 'MAX' && rows[endRowIndex].hidden) {
            endRowIndex--
        }

        select.physicsBox = {
            top: rows[startRowIndex].top,
            left: cols[startColIndex].left
        }

        select.wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: endColIndex !== 'MAX' ? cols[endColIndex].alias : 'MAX',
            endRowAlias: endRowIndex !== 'MAX' ? rows[endRowIndex].alias : 'MAX'
        }
        endColIndex = endColIndex === 'MAX' ? cols.length - 1 : endColIndex
        endRowIndex = endRowIndex === 'MAX' ? rows.length - 1 : endRowIndex

        let width = cols[endColIndex].width + cols[endColIndex].left -
            cols[startColIndex].left
        select.physicsBox.width = width

        let height = rows[endRowIndex].height + rows[endRowIndex].top -
            rows[startRowIndex].top
        select.physicsBox.height = height

        if (mouseState === LOCATE) {
            select.activePosi = {
                colAlias: cols[startColIndex].alias,
                rowAlias: rows[startRowIndex].alias
            }
            select.tempPosi = {
                initColSort: cols[startColIndex].sort,
                initRowSort: rows[startRowIndex].sort
            }
        }

        if (activeSelect.type === SELECT) {
            dispatch(actionTypes.ROWS_UPDATEACTIVEROWS, {
                oldStartAlias: activeSelect.wholePosi.startRowAlias,
                newStartAlias: select.wholePosi.startRowAlias,
                oldEndAlias: activeSelect.wholePosi.endRowAlias,
                newEndAlias: select.wholePosi.endRowAlias
            })
            dispatch(actionTypes.COLS_UPDATEACTIVECOLS, {
                oldStartAlias: activeSelect.wholePosi.startColAlias,
                newStartAlias: select.wholePosi.startColAlias,
                oldEndAlias: activeSelect.wholePosi.endColAlias,
                newEndAlias: select.wholePosi.endColAlias
            })
        }
        commit(mutationTypes.UPDATE_SELECT, {
            select: activeSelect,
            props: select
        })
    },
    /**
     * 插入选中区域
     */
    [actionTypes.SELECTS_INSERT]({
        state,
        getters,
        commit,
        rootState,
        rootGetters
    }, payload) {
        let type = payload || SELECT
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.getOprRegion
        let select = extend(template)
        let cols = getters.colList
        let rows = getters.rowList

        select.tempPosi = {
            initColSort: cols[startColIndex].sort,
            initRowSort: rows[startRowIndex].sort,
            mouseColSort: endColIndex !== 'MAX' ? cols[endColIndex].sort : 'MAX',
            mouseRowSort: endRowIndex !== 'MAX' ? rows[endRowIndex].sort : 'MAX'
        }
        select.wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: endColIndex !== 'MAX' ? cols[endColIndex].alias : 'MAX',
            endRowAlias: endRowIndex !== 'MAX' ? rows[endRowIndex].alias : 'MAX'
        }
        endColIndex = endColIndex === 'MAX' ? cols.length - 1 : endColIndex
        endRowIndex = endRowIndex === 'MAX' ? rows.length - 1 : endRowIndex

        let width = cols[endColIndex].width + cols[endColIndex].left -
            cols[startColIndex].left
        let height = rows[endRowIndex].height + rows[endRowIndex].top -
            rows[startRowIndex].top

        select.physicsBox = {
            top: rows[startRowIndex].top,
            left: cols[startColIndex].left,
            width,
            height
        }
        select.type = type
        select.alias = generator.selectAliasGenerator()
        let currentSheet = rootState.currentSheet
        commit(mutationTypes.INSERT_SELECT, {
            currentSheet,
            selects: [select]
        })
        if (type === SELECT) {
            commit(mutationTypes.ACTIVE_COL, {
                currentSheet,
                startIndex: startColIndex,
                endIndex: endColIndex
            })
            commit(mutationTypes.ACTIVE_ROW, {
                currentSheet,
                startIndex: startRowIndex,
                endIndex: endRowIndex
            })
        }
    }
}