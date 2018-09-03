import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import {
    SELECTS_INSERT,
    SELECTS_CHANGE,
    COLS_ACTIVE,
    ROWS_ACTIVE
} from '../../action-types'
import generator from '../../../tools/generator'
import template from './template'
// import {
//     SELECT,
//     LOCATE,
//     DRAG
// } from '../../../tools/constant'
// import {
//     indexAttrBinary
// } from '../../../util/binary'

export default {
    /**
     * 初始化选中区域
     */
    [SELECTS_INSERT]({
        getters,
        commit,
        dispatch
    }, {
        colAlias,
        rowAlias
    }) {
        let rows = getters.allRows
        let cols = getters.allCols
        let alias = generator.selectAliasGenerator()
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.getFullOprRegion({
            startColIndex: getters.colIndexByAlias(colAlias),
            startRowIndex: getters.rowIndexByAlias(rowAlias)
        })
        let signalSort = {
            startCol: getters.getColByIndex(startColIndex).sort,
            endCol: getters.getColByIndex(endColIndex).sort,
            startRow: getters.getRowByIndex(startRowIndex).sort,
            endRow: getters.getRowByIndex(endRowIndex).sort
        }
        let physicsBox = {
            top: rows[startRowIndex].top,
            left: cols[startColIndex].left,
            width: cols[endColIndex].width +
                cols[endColIndex].left -
                cols[startColIndex].left,
            height: rows[endRowIndex].height +
                rows[endRowIndex].top -
                rows[startRowIndex].top
        }
        let activePosi = {
            rowAlias,
            colAlias
        }
        let wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex].alias,
            endRowAlias: rows[endRowIndex].alias
        }
        let type = getters.selectState === 'select' ? 'SELECT' : 'DATESOURCE'
        let fixedSelect = extend(template, {
            alias,
            wholePosi,
            activePosi,
            physicsBox,
            signalSort,
            type
        })
        commit(mutationTypes.INSERT_SELECT, fixedSelect)
        dispatch(COLS_ACTIVE, {
            startIndex: startColIndex,
            endIndex: endColIndex
        })
        dispatch(ROWS_ACTIVE, {
            startIndex: startRowIndex,
            endIndex: endRowIndex
        })
    },
    /**
     * 更新选中区域
     */
    [SELECTS_CHANGE]({
        getters,
        commit,
        dispatch
    }, {
        activeColAlias,
        activeRowAlias,
        endColAlias = activeColAlias,
        endRowAlias = activeRowAlias,
    }) {
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.getFullOprRegion({
            startColIndex: getters.colIndexByAlias(activeColAlias),
            startRowIndex: getters.rowIndexByAlias(activeRowAlias),
            endColIndex: getters.colIndexByAlias(endColAlias),
            endRowIndex: getters.rowIndexByAlias(endRowAlias)
        })
        let signalSort = {
            startCol: getters.getColByIndex(startColIndex).sort,
            endCol: getters.getColByIndex(endColIndex).sort,
            startRow: getters.getRowByIndex(startRowIndex).sort,
            endRow: getters.getRowByIndex(endRowIndex).sort
        }
        let rows = getters.allRows
        let cols = getters.allCols
        let physicsBox = {
            top: rows[startRowIndex].top,
            left: cols[startColIndex].left,
            width: cols[endColIndex].width +
                cols[endColIndex].left -
                cols[startColIndex].left,
            height: rows[endRowIndex].height +
                rows[endRowIndex].top -
                rows[startRowIndex].top
        }
        let activePosi = {
            rowAlias: activeRowAlias,
            colAlias: activeColAlias
        }
        let selects = getters.allSelects
        let select
        selects.forEach((item, idx) => {
            if (getters.selectState === 'select') {
                select = selects[0]
            } else {
                select = selects[1]
            }
        })
        let wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex].alias,
            endRowAlias: rows[endRowIndex].alias
        }
        commit(mutationTypes.UPDATE_SELECT, {
            select,
            props: {
                signalSort,
                physicsBox,
                activePosi,
                wholePosi
            }
        })
        dispatch(COLS_ACTIVE, {
            startIndex: startColIndex,
            endIndex: endColIndex
        })
        dispatch(ROWS_ACTIVE, {
            startIndex: startRowIndex,
            endIndex: endRowIndex
        })
    }
}