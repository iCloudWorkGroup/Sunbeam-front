import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import * as actionTypes from '../../action-types'
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
        let currentSheet = rootState.currentSheet;
        let rows = getters.rowList;
        let cols = getters.colList;
        let visibleRows = getters.visibleRowList;
        let visibleCols = getters.visibleColList;
        let select = extend(template);
        let region;
        let width;
        let height;

        let col = visibleCols[0];
        let row = visibleRows[0];

        region = getters.getFullOprRegion({
            startColIndex: getters.getColIndexByAlias(col.alias),
            startRowIndex: getters.getRowIndexByAlias(row.alias)
        });
        let {startColIndex, startRowIndex, endColIndex, endRowIndex} = region;

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

        let {colIndex, rowIndex} = payload
        let currentSheet = rootState.currentSheet
        let rows = getters.rowList
        let cols = getters.colList
        let select = {}
        let activeSelect = state.activeSelect
        let mouseState = rootState.mouseState
        let region

        if (mouseState === LOCATE) {
            region = getters.getFullOprRegion({
                startColIndex: colIndex,
                startRowIndex: rowIndex
            })
        }

        if (mouseState === DRAG) {
            let tempPosi = activeSelect.tempPosi
            let wholePosi = activeSelect.wholePosi

            if (wholePosi.endColAlias === 'MAX') {
                colIndex = 'MAX'
                rowIndex = rowIndex === 'MAX' ? 0 : rowIndex
            }

            if (wholePosi.endRowAlias === 'MAX') {
                rowIndex = 'MAX'
                colIndex = colIndex === 'MAX' ? 0 : colIndex
            }

            region = getters.getFullOprRegion({
                startColIndex: indexAttrBinary(tempPosi.initColSort,
                    cols, 'sort'),
                startRowIndex: indexAttrBinary(tempPosi.initRowSort,
                    rows, 'sort'),
                endColIndex: colIndex,
                endRowIndex: rowIndex
            })
        }

        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = region

        while (cols[startColIndex].hidden) {
            startColIndex++;
        }
        while (rows[startRowIndex].hidden) {
            startRowIndex++;
        }
        while (endColIndex !== 'MAX' && cols[endColIndex].hidden) {
            endColIndex--;
        }
        while (endRowIndex !== 'MAX' && rows[endRowIndex].hidden) {
            endRowIndex--;
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
    }
}