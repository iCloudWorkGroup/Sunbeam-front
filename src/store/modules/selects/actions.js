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
            startColIndex: getters.getColIndexByAlias(colAlias),
            startRowIndex: getters.getRowIndexByAlias(rowAlias)
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
        let fixedSelect = extend(template, {
            alias,
            wholePosi,
            activePosi,
            physicsBox,
            signalSort
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
        colAlias,
        rowAlias
    }) {
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.getFullOprRegion({
            startColIndex: getters.getColIndexByAlias(colAlias),
            startRowIndex: getters.getRowIndexByAlias(rowAlias)
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
            rowAlias,
            colAlias
        }
        let wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex].alias,
            endRowAlias: rows[endRowIndex].alias
        }
        commit(mutationTypes.UPDATE_SELECT, {
            signalSort,
            physicsBox,
            activePosi,
            wholePosi
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