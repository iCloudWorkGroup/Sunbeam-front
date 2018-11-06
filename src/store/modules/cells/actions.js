import {
    COLS_OPERCOLS,
    ROWS_OPERROWS,
    A_CELLS_MERGE,
    A_CELLS_DESTORY,
    A_CELLS_SPLIT,
    CELLS_FORMAT,
    CELLS_WORDWRAP,
    SELECTS_CHANGE,
    // ROWS_ADJUSTHEIGHT,
    ROWS_EXECADJUSTHEIGHT
} from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import {
    CLIP,
    SELECT
} from '../../../tools/constant'
import {
    getTextHeight
} from '../../../tools/calcbox'
import {
    parseExpress,
    formatText,
    isNum, isDate,
    parseType, parseAddAglin, parseText,
    parsePropStruct
} from '../../../tools/format'
import {
    fixCellUpdateSend,
} from '../../../tools/fixparams'
import extend from '../../../util/extend'
import template from './template'
import generator from '../../../tools/generator'
import cache from '../../../tools/cache'
import config from '../../../config'
import send from '../../../util/send'
import parseClipStr from '../../../tools/parseclipstr'

export default {
    /**
     * 插入单元格, 允许批量插入
     * 传入单元初始化属性和占位
     * 计算出单元格的盒模型，同时维护pointsinfo
     */
    A_CELLS_ADD({
        commit,
        state,
        getters
    }, {
        props,
        flag = true
    }) {
        let cells = []
        if (!Array.isArray(props)) {
            cells.push(props)
        } else {
            cells = props
        }
        cells.forEach(function(cell) {
            let cols = getters.allCols
            let rows = getters.allRows
            // 单元格的occpuy
            let occupyCols = cell.occupy.col
            let occupyRows = cell.occupy.row

            // 单元格在行列中占的索引位置
            // 从哪行、列开始，结束
            let startColIndex = getters.colIndexByAlias(occupyCols[0])
            let endColIndex = getters.colIndexByAlias(occupyCols[occupyCols.length - 1])
            let startRowIndex = getters.rowIndexByAlias(occupyRows[0])
            let endRowIndex = getters.rowIndexByAlias(occupyRows[occupyRows.length - 1])
            let rowProp = rows[startRowIndex].props
            let colProp = cols[startColIndex].props
            // 新增单元格先去判断有无对应的行列属性
            let fixedCell
            if (flag) {
                fixedCell = extend(template, rowProp)
                fixedCell = extend(fixedCell, colProp)
            } else {
                fixedCell = extend(template, cell)
            }
            fixedCell = extend(fixedCell, cell)
            // 从occupy转成为单元格的盒模型属性
            // 用于处理合并单元格的情况
            let top = rows[startRowIndex].top
            let left = cols[startColIndex].left
            // 合并单元格，所占列没有加载时
            let width = endColIndex === -1 ? 'inhert' : caclWidth()

            function caclWidth() {
                // 当结束列为hidden是，寻找前一个，直到最前面
                for (let i = endColIndex; i > startColIndex - 1; i--) {
                    let item = cols[i]
                    if (!item.hidden) {
                        return item.left + item.width - left
                    }
                }
                return 0
            }
            let height = endRowIndex === -1 ? 'inhert' : caclHeight()

            function caclHeight() {
                // 当结束行为hidden是，寻找前一个，直到最前面
                for (let i = endRowIndex; i > startRowIndex - 1; i--) {
                    let item = rows[i]
                    if (!item.hidden) {
                        return item.top + item.height - top
                    }
                }
                return 0
            }
            fixedCell = extend(fixedCell, {
                physicsBox: {
                    top,
                    left,
                    width,
                    height
                }
            })
            if (fixedCell.alias == null) {
                fixedCell.alias = generator.cellAliasGenerator()
            }
            commit(mutationTypes.M_INSERT_CELL, fixedCell)

            // 更新坐标关系表
            commit(mutationTypes.M_UPDATE_POINTS, {
                occupyCols,
                occupyRows,
                cellIdx: state.list.length - 1
            })
        })
    },
    /**
     * 修改单元格属性
     * @param {[type]}  options.propName   [属性名，发送到后台，根据命令的不同]
     * @param {[type]}  options.propStruct [属性结构，直接覆盖独享的结构]
     * @param {Boolean} options.coordinate [修改的范围，如果是boolean值，就按照给定的方位
     * 如果是boolean值，根据视图的选中区域执行操作]
     * coordinate 内部存储的是alias
     */
    A_CELLS_UPDATE({
        state,
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct,
        coordinate = false
    }) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        let rows = getters.allRows
        let cols = getters.allCols
        let signalSort = select.signalSort
        // if ((signalSort.startCol !== 1 && signalSort.endCol === -1)
        //     || (signalSort.startRow !== 1 && signalSort.endRow === -1)) {
        //     return
        // }
        let sendArgs = fixCellUpdateSend(propStruct, propName, signalSort)
        send({
            url: config.url[propName],
            body: JSON.stringify(sendArgs)
        })
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        if (endRowIndex === -1) {
            dispatch(COLS_OPERCOLS, {
                startIndex: startColIndex,
                endIndex: endColIndex,
                props: propStruct
            })
        } else if (endColIndex === -1) {
            dispatch(ROWS_OPERROWS, {
                startIndex: startRowIndex,
                endIndex: endRowIndex,
                props: propStruct
            })
        }

        // 修正参数
        endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
        endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        // 如果有对应的单元格，修改属性
        // 如果没有对应的单元格，插入单元格
        let avoidRepeat = {}
        for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
            for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                let colAlias = cols[i].alias
                let rowAlias = rows[j].alias
                let idx = getters.IdxByRow(colAlias, rowAlias)
                if (idx !== -1) {
                    if (!avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        let cellOccupy = getters.cells[idx].occupy
                        let occupyColStartIdx = getters.colIndexByAlias(cellOccupy.col[0])
                        let occupyRowStartIdx = getters.rowIndexByAlias(cellOccupy.row[0])
                        let occupyColEndIdx = getters.colIndexByAlias(cellOccupy.col[cellOccupy.col.length - 1])
                        let occupyRowEndIdx = getters.rowIndexByAlias(cellOccupy.row[cellOccupy.row.length - 1])
                        if (occupyColEndIdx === -1 || occupyRowEndIdx === -1) {
                            return
                        }
                        if (occupyColStartIdx >= startColIndex && occupyColEndIdx <= endColIndex
                            && occupyRowStartIdx >= startRowIndex && occupyRowEndIdx <= endRowIndex) {
                            commit(mutationTypes.UPDATE_CELL, {
                                idx,
                                prop: propStruct
                            })
                        }
                    }
                } else {
                    dispatch('A_CELLS_ADD', {
                        props: extend(propStruct, {
                            occupy: {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                        }),
                    })
                }
            }
        }
    },
    /**
     * 批量修改单元格背景色
     */
    A_CELLS_ARRAY_BG({
        state,
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct,
        coordinate = false
    }) {
        let select = coordinate
        let wholePosi = select.wholePosi
        let rows = getters.allRows
        let cols = getters.allCols
        let signalSort = select.signalSort
        let sendArgs = {
            coordinate: signalSort,
            color: propStruct.content[propName]
        }
        send({
            url: config.url[propName],
            body: JSON.stringify(sendArgs)
        })
        wholePosi.forEach((item, index) => {
            if (item.startRowAlias == null || item.startColAlias == null || item.endColAlias == null || item.endRowAlias == null) {
                return
            }
            let startColIndex = getters.colIndexByAlias(item.startColAlias)
            let endColIndex = getters.colIndexByAlias(item.endColAlias)
            let startRowIndex = getters.rowIndexByAlias(item.startRowAlias)
            let endRowIndex = getters.rowIndexByAlias(item.endRowAlias)
            if (endRowIndex === -1) {
                dispatch(COLS_OPERCOLS, {
                    startIndex: startColIndex,
                    endIndex: endColIndex,
                    props: propStruct
                })
            } else if (endColIndex === -1) {
                dispatch(ROWS_OPERROWS, {
                    startIndex: startRowIndex,
                    endIndex: endRowIndex,
                    props: propStruct
                })
            }

            // 修正参数
            endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
            endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
            // 如果有对应的单元格，修改属性
            // 如果没有对应的单元格，插入单元格
            let avoidRepeat = {}
            for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
                for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                    let colAlias = cols[i].alias
                    let rowAlias = rows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1) {
                        if (!avoidRepeat[idx]) {
                            avoidRepeat[idx] = true
                            let cellOccupy = getters.cells[idx].occupy
                            let occupyColStartIdx = getters.colIndexByAlias(cellOccupy.col[0])
                            let occupyRowStartIdx = getters.rowIndexByAlias(cellOccupy.row[0])
                            let occupyColEndIdx = getters.colIndexByAlias(cellOccupy.col[cellOccupy.col.length - 1])
                            let occupyRowEndIdx = getters.rowIndexByAlias(cellOccupy.row[cellOccupy.row.length - 1])
                            if (occupyColEndIdx === -1 || occupyRowEndIdx === -1) {
                                return
                            }
                            if (occupyColStartIdx >= startColIndex && occupyColEndIdx <= endColIndex
                                && occupyRowStartIdx >= startRowIndex && occupyRowEndIdx <= endRowIndex) {
                                commit(mutationTypes.UPDATE_CELL, {
                                    idx,
                                    prop: propStruct
                                })
                            }
                        }
                    } else {
                        dispatch('A_CELLS_ADD', {
                            props: extend(propStruct, {
                                occupy: {
                                    col: [colAlias],
                                    row: [rowAlias]
                                }
                            }),
                        })
                    }
                }
            }
        })
    },
    /*
    * 设置单元格边框
    * */
    A_CELLS_BORDER({
        state,
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct,
        coordinate = false
    }) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        let rows = getters.allRows
        let cols = getters.allCols
        let signalSort = select.signalSort
        // if ((signalSort.startCol !== 1 && signalSort.endCol === -1)
        //     || (signalSort.startRow !== 1 && signalSort.endRow === -1)) {
        //     return
        // }
        let sendArgs = {
            coordinate: [signalSort]
        }
        let direction = propName.split('.')[1]
        fixBorder()
        function fixBorder() {
            let line = direction === 'all' || direction === 'none' ?
                propStruct.border.top :
                propStruct.border[direction]
            sendArgs = extend(sendArgs, {
                direction,
                line
            })
        }

        // 整行/整列操作不允许添加全边框
        if (direction === 'all' && (signalSort.endCol === -1 || signalSort.endRow === -1)) {
            return
        }
        send({
            url: config.url.border,
            body: JSON.stringify(sendArgs)
        })
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let cells = getters.cells
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        // 整行操作不能添加左/右边框
        if ((direction === 'left' || direction === 'right') && endColIndex === -1) {
            return
        }
        // 整列操作不能添加上/下边框
        if ((direction === 'top' || direction === 'bottom') && endRowIndex === -1) {
            return
        }
        if (endRowIndex === -1) {
            dispatch(COLS_OPERCOLS, {
                startIndex: startColIndex,
                endIndex: endColIndex,
                props: propStruct
            })
            if (direction === 'none') {
                if (startColIndex !== 0) {
                    let fixPropStruct = {
                        border: {
                            right: 0
                        }
                    }
                    dispatch(COLS_OPERCOLS, {
                        startIndex: startColIndex - 1,
                        endIndex: startColIndex - 1,
                        props: fixPropStruct
                    })
                }
                if (endColIndex !== cols.length - 1) {
                    let fixPropStruct = {
                        border: {
                            left: 0
                        }
                    }
                    dispatch(COLS_OPERCOLS, {
                        startIndex: endColIndex + 1,
                        endIndex: endColIndex + 1,
                        props: fixPropStruct
                    })
                }
            } else if (direction === 'left' && startColIndex !== 0) {
                let fixPropStruct = {
                    border: {
                        right: 1
                    }
                }
                dispatch(COLS_OPERCOLS, {
                    startIndex: startColIndex - 1,
                    endIndex: startColIndex - 1,
                    props: fixPropStruct
                })
            } else if (direction === 'right' && endColIndex !== cols.length - 1) {
                let fixPropStruct = {
                    border: {
                        left: 1
                    }
                }
                dispatch(COLS_OPERCOLS, {
                    startIndex: endColIndex + 1,
                    endIndex: endColIndex + 1,
                    props: fixPropStruct
                })
            }
        } else if (endColIndex === -1) {
            dispatch(ROWS_OPERROWS, {
                startIndex: startRowIndex,
                endIndex: endRowIndex,
                props: propStruct
            })
            if (direction === 'none') {
                if (startRowIndex !== 0) {
                    let fixPropStruct = {
                        border: {
                            bottom: 0
                        }
                    }
                    dispatch(ROWS_OPERROWS, {
                        startIndex: startRowIndex - 1,
                        endIndex: startRowIndex - 1,
                        props: fixPropStruct
                    })
                }
                if (endRowIndex !== rows.length - 1) {
                    let fixPropStruct = {
                        border: {
                            top: 0
                        }
                    }
                    dispatch(ROWS_OPERROWS, {
                        startIndex: endRowIndex + 1,
                        endIndex: endRowIndex + 1,
                        props: fixPropStruct
                    })
                }
            } else if (direction === 'top' && startRowIndex !== 0) {
                let fixPropStruct = {
                    border: {
                        bottom: 1
                    }
                }
                dispatch(ROWS_OPERROWS, {
                    startIndex: startRowIndex - 1,
                    endIndex: startRowIndex - 1,
                    props: fixPropStruct
                })
            } else if (direction === 'bottom' && endRowIndex !== rows.length - 1) {
                let fixPropStruct = {
                    border: {
                        top: 1
                    }
                }
                dispatch(ROWS_OPERROWS, {
                    startIndex: endRowIndex + 1,
                    endIndex: endRowIndex + 1,
                    props: fixPropStruct
                })
            }
        }
        // 修正参数
        endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
        endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        // 储存目标单元格站位信息
        let cellOccupy
        // 如果有对应的单元格，修改属性
        // 如果没有对应的单元格，插入单元格
        let avoidRepeat = {}
        for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
            for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                let colAlias = cols[i].alias
                let rowAlias = rows[j].alias
                let idx = getters.IdxByRow(colAlias, rowAlias)
                if (idx !== -1) {
                    if (!avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        commit(mutationTypes.UPDATE_CELL, {
                            idx,
                            prop: propStruct
                        })
                        cellOccupy = {
                            occupy: cells[idx].occupy
                        }
                        // 修改单元格边框会对周边单元格有连锁操作
                        if (direction === 'top') {
                            fixTopCell(cellOccupy)
                        } else if (direction === 'left') {
                            fixLeftCell(cellOccupy)
                        } else if (direction === 'right') {
                            fixRightCell(cellOccupy)
                        } else if (direction === 'bottom') {
                            fixBottomCell(cellOccupy)
                        } else {
                            fixTopCell(cellOccupy)
                            fixLeftCell(cellOccupy)
                            fixRightCell(cellOccupy)
                            fixBottomCell(cellOccupy)
                        }
                    }
                } else {
                    dispatch('A_CELLS_ADD', {
                        props: extend(propStruct, {
                            occupy: {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                        }),
                    })
                    cellOccupy = {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }
                    if (direction === 'top') {
                        fixTopCell(cellOccupy)
                    } else if (direction === 'left') {
                        fixLeftCell(cellOccupy)
                    } else if (direction === 'right') {
                        fixRightCell(cellOccupy)
                    } else if (direction === 'bottom') {
                        fixBottomCell(cellOccupy)
                    } else {
                        fixTopCell(cellOccupy)
                        fixLeftCell(cellOccupy)
                        fixRightCell(cellOccupy)
                        fixBottomCell(cellOccupy)
                    }
                }
            }
        }



        function fixBottomCell(cellOccupy) {
            let rows = getters.allRows
            let cols = getters.allCols
            let occupyEndRowIdx = getters.rowIndexByAlias(cellOccupy.occupy.row[cellOccupy.occupy.row.length - 1])
            if (occupyEndRowIdx >= rows.length - 1) {
                return
            }
            let topRow = rows[occupyEndRowIdx + 1]
            let occupyStartCol = getters.colIndexByAlias(cellOccupy.occupy.col[0])
            let occupyEndCol = getters.colIndexByAlias(cellOccupy.occupy.col[cellOccupy.occupy.col.length - 1])
            for (let i = occupyStartCol; i < occupyEndCol + 1; i++) {
                let cellIdx = getters.IdxByRow(cols[i].alias, topRow.alias)
                if (cellIdx !== -1) {
                    if (cells[cellIdx].border.top !== propStruct.border.bottom) {
                        commit(mutationTypes.UPDATE_CELL, {
                            idx: cellIdx,
                            prop: {
                                border: {
                                    top: 0
                                }
                            }
                        })
                    }
                }
            }
        }
        function fixTopCell(cellOccupy) {
            let rows = getters.allRows
            let cols = getters.allCols
            let occupyStartRowIdx = getters.rowIndexByAlias(cellOccupy.occupy.row[0])
            if (occupyStartRowIdx === 0) {
                return
            }
            let topRow = rows[occupyStartRowIdx - 1]
            let occupyStartCol = getters.colIndexByAlias(cellOccupy.occupy.col[0])
            let occupyEndCol = getters.colIndexByAlias(cellOccupy.occupy.col[cellOccupy.occupy.col.length - 1])
            for (let i = occupyStartCol; i < occupyEndCol + 1; i++) {
                let cellIdx = getters.IdxByRow(cols[i].alias, topRow.alias)
                if (cellIdx !== -1) {
                    if (cells[cellIdx].border.bottom !== propStruct.border.top) {
                        commit(mutationTypes.UPDATE_CELL, {
                            idx: cellIdx,
                            prop: {
                                border: {
                                    bottom: 0
                                }
                            }
                        })
                    }
                }
            }
        }
        function fixLeftCell(cellOccupy) {
            let rows = getters.allRows
            let cols = getters.allCols
            let occupyStartColIdx = getters.colIndexByAlias(cellOccupy.occupy.col[0])
            if (occupyStartColIdx === 0) {
                return
            }
            let leftCol = cols[occupyStartColIdx - 1]
            let occupyStartRow = getters.rowIndexByAlias(cellOccupy.occupy.row[0])
            let occupyEndRow = getters.rowIndexByAlias(cellOccupy.occupy.row[cellOccupy.occupy.row.length - 1])
            for (let i = occupyStartRow; i < occupyEndRow + 1; i++) {
                let cellIdx = getters.IdxByRow(leftCol.alias, rows[i].alias)
                if (cellIdx !== -1) {
                    if (cells[cellIdx].border.right !== propStruct.border.left) {
                        commit(mutationTypes.UPDATE_CELL, {
                            idx: cellIdx,
                            prop: {
                                border: {
                                    right: 0
                                }
                            }
                        })
                    }
                }
            }
        }
        function fixRightCell(cellOccupy) {
            let rows = getters.allRows
            let cols = getters.allCols
            let occupyEndColIdx = getters.colIndexByAlias(cellOccupy.occupy.col[cellOccupy.occupy.col.length - 1])
            if (occupyEndColIdx >= cols.length - 1) {
                return
            }
            let leftCol = rows[occupyEndColIdx + 1]
            let occupyStartRow = getters.rowIndexByAlias(cellOccupy.occupy.row[0])
            let occupyEndRow = getters.rowIndexByAlias(cellOccupy.occupy.row[cellOccupy.occupy.row.length - 1])
            for (let i = occupyStartRow; i < occupyEndRow + 1; i++) {
                let cellIdx = getters.IdxByRow(leftCol.alias, rows[i].alias)
                if (cellIdx !== -1) {
                    // fixCells.push(cells[cellIdx])
                    if (cells[cellIdx].border.left !== propStruct.border.right) {
                        commit(mutationTypes.UPDATE_CELL, {
                            idx: cellIdx,
                            prop: {
                                border: {
                                    left: 0
                                }
                            }
                        })
                    }
                }
            }
        }
    },
    /*
    * 批量清空单元格内容
    * */
    A_CELLS_CLEAN({
        state,
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct,
        coordinate = false
    }) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        let rows = getters.allRows
        let cols = getters.allCols
        let signalSort = select.signalSort
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            throw new Error('index out of loaded arrange')
        }
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        send({
            url: config.url.clean,
            body: JSON.stringify({
                coordinate: [signalSort]
            })
        })

        // 修正参数
        endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
        endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        // 如果有对应的单元格，修改属性
        // 如果没有对应的单元格，插入单元格
        let avoidRepeat = {}
        for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
            for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                let colAlias = cols[i].alias
                let rowAlias = rows[j].alias
                let idx = getters.IdxByRow(colAlias, rowAlias)
                if (idx !== -1) {
                    if (!avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        let cellOccupy = getters.cells[idx].occupy
                        let occupyColStartIdx = getters.colIndexByAlias(cellOccupy.col[0])
                        let occupyRowStartIdx = getters.rowIndexByAlias(cellOccupy.row[0])
                        let occupyColEndIdx = getters.colIndexByAlias(cellOccupy.col[cellOccupy.col.length - 1])
                        let occupyRowEndIdx = getters.rowIndexByAlias(cellOccupy.row[cellOccupy.row.length - 1])
                        if (occupyColEndIdx === -1 || occupyRowEndIdx === -1) {
                            return
                        }
                        if (occupyColStartIdx >= startColIndex && occupyColEndIdx <= endColIndex
                            && occupyRowStartIdx >= startRowIndex && occupyRowEndIdx <= endRowIndex) {
                            commit(mutationTypes.UPDATE_CELL, {
                                idx,
                                prop: propStruct
                            })
                        }
                    }
                }
            }
        }
    },
    async [A_CELLS_MERGE]({
        dispatch,
        commit,
        getters
    }, coordinate = false) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            commit('M_UPDATE_PROMPT', {
                texts: '合并单元格错误！不可整行/整列合并单元格',
                show: true,
                type: 'error'
            })
            return
        }
        let signalSort = select.signalSort
        let data = {
            coordinate: [signalSort]
        }
        await send({
            url: config.url.merge,
            body: JSON.stringify(data)
        })
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        if (endRowIndex === -1 || endColIndex === -1) {
            return
        }
        let cells = getters.cellsByTransverseHaveTexts({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })

        // 以横向优先，竖向次之查找有内容的单元格
        // 如果所有都没有内容，就查找左上角第一个单元格
        // 无边框
        // 优先以有文本内容的单元格为模板
        let templateCell = cells.length !== 0 ?
            extend(cells[0], {
                border: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            }) : extend(template)
        let cols = []
        for (let i = startColIndex; i < endColIndex + 1; i++) {
            cols.push(getters.allCols[i].alias)
        }
        let rows = []
        for (let i = startRowIndex; i < endRowIndex + 1; i++) {
            rows.push(getters.allRows[i].alias)
        }
        templateCell.occupy = {
            row: rows,
            col: cols
        }
        dispatch(A_CELLS_DESTORY, cells)
        dispatch('A_CELLS_ADD', {
            props: templateCell
        })
    },
    async [A_CELLS_SPLIT]({
        rootState,
        dispatch,
        getters,
        commit
    }, coordinate = false) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            commit('M_UPDATE_PROMPT', {
                texts: '拆分单元格错误！不可整行/整列拆分单元格',
                show: true,
                type: 'error'
            })
            return
        }
        let signalSort = select.signalSort
        let data = {
            coordinate: [signalSort]
        }
        await send({
            url: config.url.split,
            body: JSON.stringify(data)
        })
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let cells = getters.cellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })
        let insertCells = []

        cells.forEach(cell => {
            let occupyCol = cell.occupy.col
            let occupyRow = cell.occupy.row
            if (occupyRow.length > 1 || occupyCol.length > 1) {
                for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
                    for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
                        let insertCell = extend(cell, {
                            border: {
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0
                            }
                        })
                        if (i !== 0 || j !== 0) {
                            insertCell.content.texts = null
                            insertCell.content.displayTexts = null
                            insertCell.alias = generator.cellAliasGenerator()
                        }
                        insertCell.occupy = {
                            col: [occupyCol[i]],
                            row: [occupyRow[j]]
                        }
                        insertCells.push(insertCell)
                    }
                }
                dispatch(A_CELLS_DESTORY, [cell])
            }
        })
        dispatch('A_CELLS_ADD', {
            props: insertCells
        })
    },
    [CELLS_FORMAT]({
        commit,
        getters,
        rootState,
        dispatch
    }, {
        value,
        coordinate = false
    }) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : coordinate
        let wholePosi = select.wholePosi
        // if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
        //     throw new Error('index out of loaded arrange')
        // }
        let values = value.split('-')
        let format = values[0]
        let express = values[1]

        let data = {
            coordinate: [select.signalSort],
            format,
            express
        }
        send({
            url: config.url.format,
            body: JSON.stringify(data)
        })
        if (wholePosi.startRowAlias == null || wholePosi.startColAlias == null || wholePosi.endColAlias == null || wholePosi.endRowAlias == null) {
            return
        }
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let rules = parseExpress(value)
        let props = {
            content: {
                type: format,
                express
            }
        }
        let cols = getters.allCols
        let rows = getters.allRows
        endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
        if (endRowIndex === -1) {
            dispatch(COLS_OPERCOLS, {
                startIndex: startColIndex,
                endIndex: endColIndex,
                fn: parseText,
                props
            })
        } else if (endColIndex === -1) {
            dispatch(ROWS_OPERROWS, {
                startIndex: startRowIndex,
                endIndex: endRowIndex,
                fn: parseText,
                props
            })
        } else {
            let avoidRepeat = {}
            let cols = getters.allCols
            let rows = getters.allRows
            let cells = getters.cells
            for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
                for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                    let colAlias = cols[i].alias
                    let rowAlias = rows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1) {
                        if (!avoidRepeat[idx]) {
                            avoidRepeat[idx] = true
                            let display = parseText(cells[idx], format, rules, express)
                            let updateProps = extend(props, display)
                            commit(mutationTypes.UPDATE_CELL, {
                                idx,
                                prop: updateProps
                            })
                        }
                    } else {
                        let align = parseAddAglin()
                        props.content.alignRowFormat = align
                        dispatch('A_CELLS_ADD', {
                            props: extend(props, {
                                occupy: {
                                    col: [colAlias],
                                    row: [rowAlias]
                                }
                            })
                        })
                    }
                }
            }
        }
    },
    async A_CELLS_INNERPASTE({
        getters,
        commit,
        dispatch
    }) {
        let cols = getters.allCols
        let rows = getters.allRows
        let clipWholePosi = getters.selectByType('CLIP').wholePosi
        let clipStartRowIndex = getters.rowIndexByAlias(clipWholePosi.startRowAlias)
        let clipStartColIndex = getters.colIndexByAlias(clipWholePosi.startColAlias)
        let clipEndRowIndex = getters.rowIndexByAlias(clipWholePosi.endRowAlias)
        let clipEndColIndex = getters.colIndexByAlias(clipWholePosi.endColAlias)
        let clipCells = getters.cellsByVertical({
            startColIndex: clipStartColIndex,
            startRowIndex: clipStartRowIndex,
            endColIndex: clipEndColIndex,
            endRowIndex: clipEndRowIndex
        })
        if (clipCells.length === 0) {
            return
        }
        let targetWholePosi = getters.selectByType('SELECT').wholePosi
        let targetStartRowIndex = getters.rowIndexByAlias(targetWholePosi.startRowAlias)
        let targetStartColIndex = getters.colIndexByAlias(targetWholePosi.startColAlias)
        let targetEndRowIndex = targetStartRowIndex + clipEndRowIndex - clipStartRowIndex
        let targetEndColIndex = targetStartColIndex + clipEndColIndex - clipStartColIndex

        // if (targetEndColIndex > cols.length - 1 || targetEndRowIndex > rows.length - 1) {
        //     throw new Error('opration area has outter of loaded area')
        // }
        // 修正参数
        targetEndColIndex = targetEndColIndex > cols.length - 1 ? cols.length - 1 : targetEndColIndex
        targetEndRowIndex = targetEndRowIndex > rows.length - 1 ? rows.length - 1 : targetEndRowIndex
        let isLegal
        await send({
            url: config.url[cache.clipState],
            body: JSON.stringify({
                orignal: {
                    startCol: clipStartColIndex,
                    startRow: clipStartRowIndex,
                    endCol: clipEndColIndex,
                    endRow: clipEndRowIndex
                },
                target: {
                    oprCol: targetStartColIndex,
                    oprRow: targetStartRowIndex
                }
            }),
        }).then(function(data) {
            isLegal = data.isLegal
            if (!data.isLegal) {
                return
            }
        })
        if (!isLegal) {
            commit('M_UPDATE_PROMPT', {
                texts: '粘贴区域错误！合并单元格冲突！',
                show: true,
                type: 'error'
            })
            return
        }
        let disRow = targetStartRowIndex - clipStartRowIndex
        let disCol = targetStartColIndex - clipStartColIndex
        // 清空目标区域所有单元格
        let avoidRepeat = []
        let destoryCells = []
        for (let i = targetStartColIndex; i < targetEndColIndex + 1; i++) {
            for (let j = targetStartRowIndex; j < targetEndRowIndex + 1; j++) {
                let allCells = getters.cells
                let targetColAlias = cols[i].alias
                let targetRowAlias = rows[j].alias
                let targetCellIdx = getters.IdxByCol(targetColAlias, targetRowAlias)
                if (targetCellIdx !== -1 && !avoidRepeat[targetCellIdx]) {
                    avoidRepeat[targetCellIdx] = true
                    destoryCells.push(allCells[targetCellIdx])
                }
            }
        }
        dispatch('A_CELLS_DESTORY', destoryCells)
        let addCells = []
        // 获取复制区域所有单元格
        clipCells.forEach((item, index) => {
            let newColOccupy = []
            let newRowOccupy = []
            item.occupy.col.forEach((col, index) => {
                let newColIndex = getters.colIndexByAlias(col) + disCol
                if (typeof cols[newColIndex] === 'undefined') {
                    return true
                }
                newColOccupy.push(cols[newColIndex].alias)
            })
            item.occupy.row.forEach((row, index) => {
                let newRowIndex = getters.rowIndexByAlias(row) + disRow
                if (typeof rows[newRowIndex] === 'undefined') {
                    return true
                }
                newRowOccupy.push(rows[newRowIndex].alias)
            })
            let addCell = extend(item, {
                alias: null,
                occupy: {
                    col: newColOccupy,
                    row: newRowOccupy
                },
            })
            addCells.push(addCell)
        })
        dispatch('A_CELLS_ADD', {
            props: addCells
        })
        if (cache.clipState === 'cut') {
            dispatch('A_CELLS_DESTORY', clipCells)
        }
        destoryClip()
        adaptSelect()
        function destoryClip() {
            let flag = true
            if (cache.clipState !== 'cut' &&
                (targetStartRowIndex > clipEndRowIndex ||
                    targetEndRowIndex < clipStartRowIndex ||
                    targetStartColIndex > clipEndColIndex ||
                    targetEndColIndex < clipStartColIndex)
            ) {
                flag = false
            }
            if (flag) {
                let clip = getters.selectByType(CLIP)
                cache.clipState = ''
                commit(mutationTypes.DELETE_SELECT, {
                    select: clip
                })
            }
        }
        function adaptSelect() {
            dispatch(SELECTS_CHANGE, {
                activeRowAlias: rows[targetStartRowIndex].alias,
                activeColAlias: cols[targetStartColIndex].alias,
                endRowAlias: rows[targetEndRowIndex].alias,
                endColAlias: cols[targetEndColIndex].alias
            })
        }
    },
    async A_CELLS_OUTERPASTE({
        state,
        dispatch,
        getters,
        commit,
        rootState
    }, texts) {
        // let activeCell = getters.activeCell()
        // let colAlias = activeCell.occupy.col[0]
        // let rowAlias = activeCell.occupy.row[0]
        let select = getters.selectByType('SELECT')
        let colAlias = select.wholePosi.startColAlias
        let rowAlias = select.wholePosi.startRowAlias
        // let endcolAlias = select.wholePosi.endColAlias
        // let endrowAlias = select.wholePosi.endRowAlias
        let cells = getters.cells
        let rules
        let date
        let oprCol = getters.getColByAlias(colAlias)
        let oprRow = getters.getRowByAlias(rowAlias)

        let parseData = parseClipStr(texts)
        let startColIndex = getters.getColIndexBySort(oprCol.sort)
        let startRowIndex = getters.getRowIndexBySort(oprRow.sort)
        let parseColLen = parseData.colLen
        let parseRowLen = parseData.rowLen
        let cols = getters.allCols
        let rows = getters.allRows
        let endColIndex = startColIndex + parseColLen - 1
        let endRowIndex = startRowIndex + parseRowLen - 1
        if (endColIndex > cols.length - 1 || endRowIndex > rows.length - 1) {
            throw new Error('opration area has outter of loaded area')
        }
        let isLegal
        await send({
            url: config.url['outerpaste'],
            body: JSON.stringify({
                oprCol: oprCol.sort,
                oprRow: oprRow.sort,
                content: texts
            })
        }).then(function(data) {
            isLegal = data.isLegal
            if (!data.isLegal) {
                return
            }
        })
        if (!isLegal) {
            commit('M_UPDATE_PROMPT', {
                texts: '粘贴区域错误！无法对合并单元格进行此操作！',
                show: true,
                type: 'error'
            })
            return
        }

        // 清除复制选中区
        // 这部分还没做，需要些函数来确定
        let parseCells = parseData.data
        parseCells.forEach(cell => {
            let formatObj = parseType(cell.text)
            let propStruct = { content: {}}
            let nowCell
            let colAlias = cols[cell.colRelative + startColIndex].alias
            let rowAlias = rows[cell.rowRelative + startRowIndex].alias
            let rowIndex = getters.rowIndexByAlias(rowAlias)
            let colIndex = getters.colIndexByAlias(colAlias)
            let row = getters.allRows[rowIndex].props.content
            let col = getters.allCols[colIndex].props.content
            let idx = getters.IdxByRow(colAlias, rowAlias)
            if (idx !== -1) {
                nowCell = cells[idx]
            }
            if (formatObj.autoRecType === 'text') {
                propStruct.content.texts = cell.text
                propStruct.content.displayTexts = cell.text
                // 修正单元格对齐方式
                propStruct.content.alignRowFormat = 'left'
            } else {
                let fixProp = parsePropStruct(nowCell, formatObj, cell.text, row, col)
                let express = fixProp.content.express
                let fixText = fixProp.content.texts
                propStruct.content = fixProp.content
                rules = parseExpress(express)
                date = fixProp.date
                if (express !== '@') {
                    rules = parseExpress(express)
                    date = formatObj.date
                    propStruct.content.displayTexts = parseText(fixText)
                } else {
                    propStruct.content.displayTexts = fixText
                }
            }
            if (idx === -1) {
                dispatch('A_CELLS_ADD', {
                    props: extend(propStruct, {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }),
                })
            } else {
                commit(mutationTypes.UPDATE_CELL, {
                    idx,
                    prop: propStruct
                })
            }
        })
        function parseText(texts) {
            let text = texts
            if (date && isDate(text)) {
                text = formatText(rules, text)
            } else if (!date && isNum(text)) {
                text = formatText(rules, parseFloat(text, 10))
            }
            return text
        }
    },
    async [CELLS_WORDWRAP]({
        dispatch,
        commit,
        getters
    }, payload) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可调整换行，请取消冻结后重试！',
                show: true,
                type: 'error'
            })
            return
        }
        let startColIndex
        let startRowIndex
        let endColIndex
        let endRowIndex
        if (payload) {
            startColIndex = payload.startColIndex
            startRowIndex = payload.startRowIndex
            endRowIndex = startRowIndex
            endColIndex = startColIndex
        } else {
            let region = getters.getOprRegion()
            startColIndex = region.startColIndex
            startRowIndex = region.startRowIndex
            endRowIndex = region.endRowIndex
            endColIndex = region.endColIndex
        }
        let value
        let cell = getters.cellsByVertical({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })[0]
        if (cell) {
            value = !cell.content.wordWrap
        } else {
            value = true
        }
        let oprRows
        let props = {
            content: {
                wordWrap: value
            }
        }
        if (endRowIndex === -1) {
            throw new Error('CUSTOM ERROR:row index out of loaded arrange')
            // dispatch(COLS_OPERCOLS, {
            //     startIndex: startColIndex,
            //     endIndex: endColIndex,
            //     props
            // })
        } else if (endColIndex === -1) {
            throw new Error('CUSTOM ERROR:col index out of loaded arrange')
            // dispatch(ROWS_OPERROWS, {
            //     startIndex: startRowIndex,
            //     endIndex: endRowIndex,
            //     props
            // })
        } else {
            if (value) {
                oprRows = getAdaptRows()
            }
            if (oprRows && oprRows.length !== 0) {
                oprRows.forEach(info => {
                    dispatch(ROWS_EXECADJUSTHEIGHT, {
                        sort: info.index,
                        value: info.height
                    })
                })
                props = extend(props, {
                    row: {
                        index: oprRows[0].index,
                        height: oprRows[0].height
                    },
                })
            }
            dispatch('A_CELLS_UPDATE', {
                propName: 'wordWrap',
                propStruct: props
            })
        }
        // 获得换行后的高度
        function getAdaptRows() {
            let cols = getters.allCols
            let rows = getters.allRows
            let cells = getters.cells
            let temp = {}
            let oprRows = []
            for (let i = startRowIndex; i < endRowIndex + 1; i++) {
                let maxHeight = 0
                let rowAlias = rows[i].alias
                for (let j = startColIndex; j < endColIndex + 1; j++) {
                    let colAlias = cols[j].alias
                    let cellIdx = getters.IdxByRow(colAlias, rowAlias)
                    if (cellIdx !== -1 && !temp[cellIdx]) {
                        let cell = cells[cellIdx]
                        if (cell.occupy.col.length === 1 && cell.occupy.row.length ===
                            1) {
                            let height = getTextHeight(cell.content.texts,
                                cell.content.size,
                                cell.content.family,
                                cell.physicsBox.width)
                            if (height > maxHeight) {
                                maxHeight = height
                            }
                        }
                    }
                }
                if (maxHeight > rows[i].height) {
                    oprRows.push({
                        index: i,
                        height: maxHeight
                    })
                }
            }
            return oprRows
        }
    },
    /**
     * 销毁单元格，允许批量销毁
     */
    [A_CELLS_DESTORY]({
        getters,
        commit
    }, cells) {
        cells.forEach((cell) => {
            commit(mutationTypes.M_DESTORY_CELL, cell)
            let occupyCols = cell.occupy.col
            let occupyRows = cell.occupy.row
            commit(mutationTypes.M_DELETE_POINTS, {
                delOccupyCols: occupyCols,
                delOccupyRows: occupyRows
            })
        })
    }
}