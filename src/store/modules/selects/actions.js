import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import {
    SELECTS_INSERT,
    SELECTS_CHANGE,
    COLS_ACTIVE,
    ROWS_ACTIVE,
    SELECTS_DELETE
} from '../../action-types'
import generator from '../../../tools/generator'
import template from './template'
import config from '../../../config'
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
        // let {
        //     startColIndex,
        //     startRowIndex,
        //     endColIndex,
        //     endRowIndex
        // } = getters.fullRegion({
        //     startColIndex: getters.colIndexByAlias(colAlias),
        //     startRowIndex: getters.rowIndexByAlias(rowAlias)
        // })
        let startRowIndex = 0
        let startColIndex = 0
        let endColIndex = 0
        let endRowIndex = 0
        let signalSort = {
            startCol: getters.getColByIndex(startColIndex).sort,
            endCol: getters.getColByIndex(endColIndex).sort,
            startRow: getters.getRowByIndex(startRowIndex).sort,
            endRow: getters.getRowByIndex(endRowIndex).sort
        }
        let physicsBox = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        }
        let activePosi = {
            rowAlias: rows[startRowIndex].alias,
            colAlias: cols[startColIndex].alias
        }
        let wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex].alias,
            endRowAlias: rows[endRowIndex].alias
        }
        let fixedSelect = extend(template, {
            type: getters.activeType,
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
        activeColAlias,
        activeRowAlias,
        endColAlias = activeColAlias,
        endRowAlias = activeRowAlias,
    }) {
        config.autoInput = true
        let rows = getters.allRows
        let cols = getters.allCols
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.fullRegion({
            startColIndex: getters.colIndexByAlias(activeColAlias),
            startRowIndex: getters.rowIndexByAlias(activeRowAlias),
            endColIndex: getters.colIndexByAlias(endColAlias),
            endRowIndex: getters.rowIndexByAlias(endRowAlias)
        })
        if (endRowAlias === 'MAX' && activeRowAlias === rows[0].alias) {
            startRowIndex = 0
            endRowIndex = -1
            startColIndex = getters.colIndexByAlias(activeColAlias)
            endColIndex = startColIndex
        }
        if (endColAlias === 'MAX' && activeColAlias === cols[0].alias) {
            startColIndex = 0
            endColIndex = -1
            startRowIndex = getters.rowIndexByAlias(activeRowAlias)
            endRowIndex = startRowIndex
        }
        if (startRowIndex === -1 || endRowIndex === -1 || startColIndex === -1 || endColIndex === -1) {
            if (startColIndex === -1) {
                let temp
                temp = startColIndex
                startColIndex = endColIndex
                endColIndex = temp
            }
            if (startRowIndex === -1) {
                let temp
                temp = startRowIndex
                startRowIndex = endRowIndex
                endRowIndex = temp
            }
        }
        let wholePosi = {
            startColAlias: cols[startColIndex].alias,
            startRowAlias: rows[startRowIndex].alias,
            endColAlias: cols[endColIndex] ? cols[endColIndex].alias : 'MAX',
            endRowAlias: rows[endRowIndex] ? rows[endRowIndex].alias : 'MAX'
        }
        let signalSort = {
            startCol: getters.getColByIndex(startColIndex).sort,
            endCol: getters.getColByIndex(endColIndex) ? getters.getColByIndex(endColIndex).sort : -1,
            startRow: getters.getRowByIndex(startRowIndex).sort,
            endRow: getters.getRowByIndex(endRowIndex) ? getters.getRowByIndex(endRowIndex).sort : -1
        }
        endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
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
        if (rows[endRowIndex].hidden) {
            physicsBox.height -= rows[endRowIndex].height
        }
        if (cols[endColIndex].hidden) {
            physicsBox.width -= cols[endColIndex].width
        }
        let activePosi = {
            rowAlias: activeRowAlias,
            colAlias: activeColAlias
        }
        commit(mutationTypes.UPDATE_SELECT, {
            props: {
                signalSort,
                physicsBox,
                activePosi,
                wholePosi,
            },
            type: getters.activeType
        })
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
     * 删除选中区域
     */
    [SELECTS_DELETE]({
        getters,
        commit,
        dispatch
    }, payload) {
        commit(mutationTypes.DELETE_SELECT, {
            select: payload.select
        })
        let select = getters.allSelects[0]
        let startColIndex = select.signalSort.startCol
        let endColIndex = select.signalSort.endCol
        let startRowIndex = select.signalSort.startRow
        let endRowIndex = select.signalSort.endRow
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