import Vue from 'vue'
import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import config from '../../../config'
import cache from '../../../tools/cache'
import extend from '../../../util/extend'
import generator from '../../../tools/generator'
import template from './template'
import {
    getRowDisplayName
} from '../../../util/displayname'
import {
    SELECT
} from '../../../tools/constant'
import send from '../../../util/send'

export default {
    /**
     * 添加行，允许批量添加
     */
    [actionTypes.ROWS_ADD]({
        state,
        rootState,
        commit
    }, rows) {
        let ret = []
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            row.displayName = getRowDisplayName(row.sort)
            if (row.alias == null) {
                row.alias = generator.rowAliasGenerator()
            }
            ret.push(extend(template, row))
        }
        commit(mutationTypes.ADD_ROW, {
            rows: ret
        })
    },
    [actionTypes.ROWS_ACTIVE]({
        state,
        commit
    }, {
        startIndex,
        endIndex
    }) {
        commit(mutationTypes.CANCEL_ACTIVE_ROW)
        commit(mutationTypes.ACTIVE_ROW, {
            startIndex,
            endIndex
        })
    },
    async [actionTypes.ROWS_HIDE]({
        commit,
        getters,
        dispatch
    }, payload) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可隐藏行，请取消冻结后重试！',
                show: true
            })
            return
        }
        if (getters.visibleRowList().length < 2) {
            return
        }
        let index = payload
        if (typeof index === 'undefined') {
            let select = getters.selectByType(SELECT)
            if (select.wholePosi.endRowAlias === 'MAX') {
                return
            }
            index = getters.rowIndexByAlias(select.wholePosi.startRowAlias)
        }
        let rows = getters.allRows
        let row = rows[index]
        if (row.hidden) {
            return
        }
        dispatch(actionTypes.ROWS_EXECHIDE, row.sort)
        await send({
            url: config.url.hiderow,
            body: JSON.stringify({
                row: row.sort
            })
        })
    },
    [actionTypes.ROWS_EXECHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let index = getters.getRowIndexBySort(sort)
        let rows = getters.allRows
        // let visibleRows = getters.visibleRowList()
        // 将被隐藏行
        let row = rows[index]
        let updateCellInfo = []
        let rowHeight = row.height
        let rowAlias = row.alias
        let max = getters.max
        commit('UPDATE_SHEETS_MAX', {
            rowPixel: max.rowPixel - rowHeight - 1
        })
        /**
         * 隐藏行
         * 将需要隐藏的行hidden设为true
         * 并修改前一行bottomAjacentHide属性为true
         * 隐藏行后面所有行top上移
         */
        let updateRowInfo = [{
            row: rows[index],
            props: {
                hidden: true,
                active: false
            }
        }]

        if (index > 0) {
            updateRowInfo.push({
                row: rows[index - 1],
                props: {
                    bottomAjacentHide: true
                }
            })
        }
        for (let i = index + 1, len = rows.length; i < len; i++) {
            let row = rows[i]
            updateRowInfo.push({
                row,
                props: {
                    top: row.top - rowHeight - 1
                }
            })
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= rowHeight + 1
        }
        /**
         * 对隐藏行(包括隐藏行)之下所有单元格进行样式修改
         */
        let cells = getters.cellsByOpr({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: -1,
            endRowIndex: -1,
        })
        cells.forEach(function(cell) {
            let occupy = cell.occupy.row
            if (occupy.indexOf(rowAlias) !== -1) {
                if (occupy.length === 1) {
                    updateCellInfo.push({
                        cell,
                        props: {
                            status: {
                                hidden: true
                            },
                            physicsBox: {
                                height: 0
                            }
                        }
                    })
                } else {
                    cell.physicsBox.height - rowHeight - 1 > 0 ?
                        updateCellInfo.push({
                            cell,
                            props: {
                                physicsBox: {
                                    height: cell.physicsBox.height -
                                        rowHeight - 1
                                }
                            }
                        }) :
                        updateCellInfo.push({
                            cell,
                            props: {
                                physicsBox: {
                                    height: 0
                                },
                                status: {
                                    hidden: true
                                }
                            }
                        })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top -
                                rowHeight - 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            let occupyCol = item.cell.occupy.col[0]
            let occupyRow = item.cell.occupy.row[0]
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(occupyCol, occupyRow),
                prop: item.props
            })
        })

        let updateSelectInfo = []
        // let rowTop = row.top
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let rowSort = row.sort
            // let endVisibleSort = visibleRows[visibleRows.length - 1].sort
            let startSort = getters.getRowByAlias(wholePosi.startRowAlias).sort
            let endSort = getters.getRowByAlias(wholePosi.endRowAlias).sort
            // 第一种情况 选择单行
            if (startSort === endSort) {
                // 隐藏行为选择行
                if (startSort === rowSort) {
                    updateSelectInfo.push({
                        type: getters.activeType,
                        props: {
                            physicsBox: {
                                height: 0
                            }
                        }
                    })
                }
                // 隐藏行在选择行上方
                if (startSort > rowSort) {
                    updateSelectInfo.push({
                        type: getters.activeType,
                        props: {
                            physicsBox: {
                                top: rows[startSort].top,
                            }
                        }
                    })
                }
            }
            // 第二种情况 选择多行
            if (startSort < endSort) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height -
                            rowHeight - 1
                        },
                        wholePosi: {
                            startRowAlias: rows[index + 1].alias
                        },
                        signalSort: {
                            startRow: index + 1
                        },
                        active: {
                            startRowAlias: rows[index + 1].alias,
                        }
                    }
                })
            }
        })
        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item)
        })

    },
    async [actionTypes.ROWS_CANCELHIDE]({
        getters,
        commit,
        dispatch
    }, payload) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可显示行，请取消冻结后重试！',
                show: true
            })
            return
        }
        let index = payload
        let rows = getters.allRows
        let visibleRows = getters.visibleRowList()

        if (typeof index === 'undefined') {
            let select = getters.selectByType(SELECT)
            let visibleStartRow = visibleRows[0]
            let visibleEndRow = visibleRows[visibleRows.length - 1]
            let startRowAlias = select.wholePosi.startRowAlias
            let endRowAlias = select.wholePosi.endRowAlias
            if (endRowAlias === 'MAX') {
                return
            }
            let startIndex = getters.rowIndexByAlias(startRowAlias)
            let endIndex = getters.rowIndexByAlias(endRowAlias)
            if (visibleStartRow.alias === startRowAlias &&
                visibleStartRow !== rows[0] && startRowAlias === endRowAlias) {
                index = startIndex - 1
            } else if (visibleEndRow.alias === endRowAlias &&
                visibleEndRow !== rows[rows.length - 1] && startRowAlias === endRowAlias) {
                index = rows.length - 1
            } else {
                for (let i = startIndex; i <= endIndex + 1; i++) {
                    if (rows[i].hidden) {
                        index = i
                        break
                    }
                }
            }
        }
        if (typeof index === 'undefined' || !rows[index].hidden) {
            return
        }
        dispatch(actionTypes.ROWS_EXECCANCELHIDE, rows[index].sort)
        await send({
            url: config.url.showrow,
            body: JSON.stringify({
                row: rows[index].sort
            }),
        })
    },
    [actionTypes.ROWS_EXECCANCELHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let index = getters.getRowIndexBySort(sort)
        let rows = getters.allRows
        let row = rows[index]

        let updateCellInfo = []
        let rowHeight = row.height
        let rowAlias = row.alias
        let max = getters.max
        commit('UPDATE_SHEETS_MAX', {
            rowPixel: max.rowPixel + rowHeight + 1
        })
        let updateRowInfo = [{
            row: rows[index],
            props: {
                hidden: false
            }
        }]

        if (index > 0) {
            updateRowInfo.push({
                row: rows[index - 1],
                props: {
                    bottomAjacentHide: false
                }
            })
        }
        for (let i = index + 1, len = rows.length; i < len; i++) {
            let row = rows[i]
            updateRowInfo.push({
                row,
                props: {
                    top: row.top + rowHeight + 1
                }
            })
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
        let cells = getters.cellsByOpr({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: -1,
            endRowIndex: -1,
        })
        cells.forEach(function(cell) {
            let occupy = cell.occupy.row
            if (occupy.indexOf(rowAlias) !== -1) {
                if (occupy.length === 1) {
                    updateCellInfo.push({
                        cell,
                        props: {
                            status: {
                                hidden: false
                            },
                            physicsBox: {
                                height: cell.physicsBox.height + rowHeight
                            }
                        },
                    })
                } else {
                    cell.physicsBox.height > 0 ?
                        updateCellInfo.push({
                            cell,
                            props: {
                                physicsBox: {
                                    height: cell.physicsBox.height + rowHeight
                                }
                            }
                        }) :
                        updateCellInfo.push({
                            cell,
                            props: {
                                status: {
                                    hidden: false
                                },
                                physicsBox: {
                                    height: cell.physicsBox.height + rowHeight + 1
                                }
                            }
                        })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            let occupyRow = item.cell.occupy.row[0]
            let occupyCol = item.cell.occupy.col[0]
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(occupyCol, occupyRow),
                prop: item.props
            })
        })
        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi

            let startIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            if (startIndex === index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: rowHeight + 1
                        }
                    }
                })
            } else if (startIndex > index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                rowHeight + 1
                        }
                    }
                })
                commit(mutationTypes.UPDATE_ROW, [{
                    row: rows[index],
                    props: {
                        active: true
                    }
                }])
            }
            if (cache.localRowPosi > 0) {
                cache.localRowPosi += rowHeight + 1
            }
        })

        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item)
        })
    },
    [actionTypes.ROWS_INSERTROW]({
        getters,
        commit,
        dispatch
    }, payload) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可插入行，请取消冻结后重试！',
                show: true
            })
            return
        }
        let index = payload
        if (typeof index === 'undefined') {
            let select = getters.selectByType(getters.activeType)
            if (select.wholePosi.endRowAlias === 'MAX') {
                return
            }
            index = getters.rowIndexByAlias(select.wholePosi.startRowAlias)
        }
        let row = getters.allRows[index]
        let sort = row.sort
        send({
            url: config.url.insertrow,
            body: JSON.stringify({
                row: sort,
            }),
        })
        let rowModel
        rowModel = index === 0 ? rowModel : getters.allRows[index - 1]
        dispatch(actionTypes.ROWS_EXECINSERTROW, {
            sort,
            rowModel
        })
    },
    [actionTypes.ROWS_EXECINSERTROW]({
        getters,
        commit,
        dispatch,
        rootState
    }, {
        sort,
        rowModel
    }) {
        let insertRow
        let rows = getters.allRows
        let index = getters.getRowIndexBySort(sort)
        if (!rowModel) {
            insertRow = extend(template)
        } else {
            insertRow = extend(rowModel)
        }
        insertRow.hidden = false
        insertRow.alias = generator.rowAliasGenerator()
        insertRow.sort = sort
        insertRow.displayName = getRowDisplayName(sort)
        insertRow.top = rows[index].top
        let max = getters.max
        commit('UPDATE_SHEETS_MAX', {
            rowPixel: max.rowPixel + insertRow.height + 1
        })
        let rowHeight = insertRow.height
        let insertRowAlias = insertRow.alias
        let currentRowAlias = rows[index].alias
        let insertRowTop = insertRow.top
        let cells

        cells = getters.cellsByOpr({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: -1,
            endRowIndex: -1,
        })

        let updateCellInfo = []
        cells.forEach(function(cell) {
            let occupyRow = cell.occupy.row
            if (cell.physicsBox.top >= insertRowTop) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            } else {
                let aliasIndex = occupyRow.indexOf(currentRowAlias)
                let newOccupy = [...occupyRow]
                let occupyCol = cell.occupy.col
                let cellIndex

                newOccupy.splice(aliasIndex, 0, insertRowAlias)
                cellIndex = getters.IdxByRow(occupyCol[0], occupyRow[0])
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height +
                                rowHeight + 1
                        },
                        occupy: {
                            row: newOccupy
                        }
                    }
                })
                occupyCol.forEach(function(colAlias) {
                    commit(mutationTypes.M_UPDATE_POINTS, {
                        occupyCols: occupyCol,
                        occupyRows: newOccupy,
                        cellIdx: cellIndex
                    })
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0],
                    item.cell.occupy.row[0]),
                prop: item.props
            })
        })
        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex
            let endIndex
            startIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            endIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)

            if (startIndex >= index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                rowHeight + 1
                        }
                    }
                })
                insertRow.active = true
            }
        })

        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item)
        })

        insertRow.top = rows[index].top
        let updateRowInfo = []
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i]
            updateRowInfo.push({
                row,
                props: {
                    top: row.top + rowHeight + 1,
                    sort: row.sort + 1,
                    displayName: getRowDisplayName(row.sort + 1)
                }
            })
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
        commit(mutationTypes.INSERT_ROW, {
            rows: [insertRow]
        })
        // 当前行不为第一行时, 以前一行单元格模板插入/修改单元格occupy、alias、texts、displayTexts
        if (index !== 0) {
            cells = getters.cellsByOpr({
                startColIndex: 0,
                startRowIndex: index - 1,
                endColIndex: -1,
                endRowIndex: index - 1,
            })
            cells.forEach((item, index) => {
                if (item.occupy.row.length === 1) {
                    dispatch('A_CELLS_ADD', {
                        props: extend(item, {
                            alias: null,
                            content: {
                                texts: null,
                                displayTexts: null
                            },
                            occupy: {
                                col: item.occupy.col,
                                row: [insertRow.alias]
                            }
                        })
                    })
                }
            })
        }
        if (cache.localRowPosi > 0) {
            cache.localRowPosi += rowHeight + 1
        }
        /**
         * 只有在删除单元格的回退操作，才会传入列对象
         * 回退操作不需要进行前一列上单元格的复制操作
         */
        if (!rowModel && index > 0) {
            cells = getters.cellsByVertical({
                startRowIndex: index - 1,
                startColIndex: 0,
                endRowIndex: index - 1,
                endColIndex: 'MAX',
            })
            let insertCellList = []
            let previousAlias = rows[index - 1].alias
            cells.forEach(cell => {
                let occupyCol = cell.occupy.col
                let occupyRow = cell.occupy.row
                if (occupyRow.indexOf(previousAlias) === occupyRow.length -
                    1) {
                    occupyCol.forEach(alias => {
                        let insertCell = extend(cell)
                        insertCell.occupy = {
                            col: [alias],
                            row: [insertRowAlias]
                        }
                        insertCell.content.texts = ''
                        insertCellList.push(insertCell)
                    })
                }
            })
            dispatch(actionTypes.A_CELLS_ADD, {
                props: insertCellList
            })
        }
    },
    [actionTypes.ROWS_ADJUSTHEIGHT]({
        dispatch,
        commit,
        getters
    }, {
        index,
        height
    }) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可调整行高，请取消冻结后重试！',
                show: true
            })
            return
        }
        let rows = getters.allRows
        let row = rows[index]
        let limitHeight = height > 5 ? height : 5
        dispatch(actionTypes.ROWS_EXECADJUSTHEIGHT, {
            sort: row.sort,
            value: limitHeight
        })
        send({
            url: config.url.adjustrow,
            body: JSON.stringify({
                row: row.sort,
                offset: limitHeight
            }),
        })
    },
    [actionTypes.ROWS_EXECADJUSTHEIGHT]({
        state,
        rootState,
        commit,
        getters
    }, {
        sort,
        value
    }) {
        let rows = getters.allRows
        let index = getters.getRowIndexBySort(sort)
        let row = rows[index]
        let rowAlias = row.alias
        let adjustHeight = value - row.height

        let max = getters.max
        if (adjustHeight !== 0 && row.height === 0) {
            commit('UPDATE_SHEETS_MAX', {
                rowPixel: max.rowPixel + adjustHeight + 1
            })
        } else if (adjustHeight !== 0 && value === 0) {
            commit('UPDATE_SHEETS_MAX', {
                rowPixel: max.rowPixel + adjustHeight - 1
            })
        } else {
            commit('UPDATE_SHEETS_MAX', {
                rowPixel: max.rowPixel + adjustHeight
            })
        }
        let updateCellInfo = []
        let cells = getters.cellsByOpr({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: -1,
            endRowIndex: -1,
        })
        cells.forEach(function(cell) {
            let occupy = cell.occupy.row
            let temp = occupy.indexOf(rowAlias)
            if (temp !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height +
                                adjustHeight
                        }
                    }
                })
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top +
                                adjustHeight
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0],
                    item.cell.occupy.row[0]),
                prop: item.props
            })
        })

        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            if (startIndex <= index && endIndex >= index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                adjustHeight
                        }
                    }
                })
            } else if (startIndex > index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                adjustHeight
                        }
                    }
                })

            }
        })
        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item)
        })
        let updateRowInfo = []
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i]
            if (i === index) {
                updateRowInfo.push({
                    row,
                    props: {
                        height: value,
                    }
                })
            } else {
                updateRowInfo.push({
                    row,
                    props: {
                        top: row.top + adjustHeight,
                    }
                })
            }

        }

        if (cache.localRowPosi > 0) {
            cache.localRowPosi += adjustHeight
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
    },
    [actionTypes.ROWS_DELETEROW]({
        getters,
        commit,
        dispatch,
    }, payload) {
        if (getters.isFrozen()) {
            commit('M_UPDATE_PROMPT', {
                texts: '冻结状态下不可删除行，请取消冻结后重试！',
                show: true
            })
            return
        }
        let index = payload
        if (typeof index === 'undefined') {
            let select = getters.selectByType(SELECT)
            if (select.wholePosi.endRowAlias === 'MAX') {
                return
            }
            index = getters.rowIndexByAlias(select.wholePosi.startRowAlias)
        }
        let rows = getters.allRows
        let row = rows[index]

        send({
            url: config.url['deleterow'],
            body: JSON.stringify({
                row: row.sort
            }),
        })
        dispatch(actionTypes.ROWS_EXECDELETEROW, row.sort)
    },
    [actionTypes.ROWS_EXECDELETEROW]({
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let index = getters.getRowIndexBySort(sort)
        let cells = getters.cellsByOpr({
            startRowIndex: index,
            startColIndex: 0,
            endColIndex: -1,
            endRowIndex: -1,
        })
        let rows = getters.allRows
        let deleteRow = rows[index]
        let deleteRowAlias = deleteRow.alias
        let deleteRowHeight = deleteRow.height
        let updateOccupys = []
        let updateCellInfo = []
        let max = getters.max
        commit('UPDATE_SHEETS_MAX', {
            rowPixel: max.rowPixel - deleteRow.height - 1
        })
        cells.forEach(function(cell) {
            let occupyRow = cell.occupy.row
            let aliasIndex
            if ((aliasIndex = occupyRow.indexOf(deleteRowAlias)) !== -1) {
                cell.occupy.col.forEach(alias => {
                    updateOccupys.push({
                        occupyCols: [alias],
                        occupyRows: [deleteRowAlias]
                    })
                })
                if (occupyRow.length === 1) {
                    commit(mutationTypes.M_DESTORY_CELL, cell)
                } else {
                    let newOccupyRow = [...occupyRow]
                    newOccupyRow.splice(aliasIndex, 1)
                    updateCellInfo.push({
                        cell,
                        props: {
                            occupy: {
                                row: newOccupyRow
                            },
                            physicsBox: {
                                height: cell.physicsBox.height -
                                    deleteRowHeight - 1
                            }
                        }
                    })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top -
                                deleteRowHeight - 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0],
                    item.cell.occupy.row[0]),
                prop: item.props
            })
        })

        // delete
        updateOccupys.forEach((item, index) => {
            commit(mutationTypes.M_DELETE_POINTS, {
                delOccupyCols: item.occupyCols,
                delOccupyRows: item.occupyRows,
            })
        })
        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)

            if (startIndex === index) {
                if (startIndex === endIndex) {
                    if (index === rows.length - 1) {
                        updateSelectInfo.push({
                            type: getters.activeType,
                            props: {
                                physicsBox: {
                                    height: rows[index - 1].height
                                },
                                wholePosi: {
                                    startRowAlias: rows[index -
                                        1].alias,
                                    endRowAlias: rows[index - 1]
                                        .alias
                                }
                            }
                        })
                        commit(mutationTypes.ACTIVE_ROW, {
                            startIndex: index - 1
                        })
                    } else {
                        updateSelectInfo.push({
                            type: getters.activeType,
                            props: {
                                physicsBox: {
                                    height: rows[index + 1].height
                                },
                                wholePosi: {
                                    startRowAlias: rows[index +
                                        1].alias,
                                    endRowAlias: rows[index + 1]
                                        .alias
                                }
                            }
                        })
                        commit(mutationTypes.ACTIVE_ROW, {
                            startIndex: index + 1
                        })
                    }
                } else {
                    updateSelectInfo.push({
                        type: getters.activeType,
                        props: {
                            physicsBox: {
                                height: select.physicsBox.height -
                                    deleteRowHeight - 1
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias
                            }
                        }
                    })
                }
            } else if (startIndex > index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top -
                                deleteRowHeight - 1
                        }
                    }
                })
            } else if (endIndex === index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height -
                                rows[index + 1].height - 1
                        },
                        wholePosi: {
                            endRowAlias: rows[index - 1].alias
                        }
                    }
                })
            } else if (endIndex < index) {
                updateSelectInfo.push({
                    type: getters.activeType,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height -
                                rows[index + 1].height - 1
                        }
                    }
                })
            }
        })

        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item)
        })

        let updateRowInfo = []
        for (let i = index + 1, len = rows.length; i < len; i++) {
            let row = rows[i]
            updateRowInfo.push({
                row,
                props: {
                    top: row.top - deleteRowHeight - 1,
                    sort: row.sort - 1,
                    displayName: getRowDisplayName(row.sort - 1)
                }
            })
        }

        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= deleteRowHeight + 1
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
        Vue.nextTick(function() {
            let rowRecord = cache.rowRecord
            let temp
            if ((temp = rowRecord.indexOf(deleteRowAlias)) !== -1) {
                _updateLoadInfo(temp, getters)
                dispatch(actionTypes.OCCUPY_DELETEROW, deleteRowAlias)
                rowRecord.splice(temp, 1)
            }
            commit(mutationTypes.DELETE_ROW, {
                index
            })
        })

        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord
            let colLoadRecord = cache.colRecord
            let rowLoadRecord = cache.rowRecord
            let rows = getters.rowList
            let alias = rowLoadRecord[index]
            let previousAlias
            let nextAlias
            let replaceAlias

            // 声明这个变量是为了代码通过检查，
            // 实际的功能没有通过，需要重写这部分代码
            let colIndex

            if (index === 0) {
                replaceAlias = rows[colIndex + 1].alias
                nextAlias = rowLoadRecord[1]
            } else if (index === rowLoadRecord.length - 1) {
                replaceAlias = rows[colIndex - 1].alias
                previousAlias = rowLoadRecord[index - 1]
            } else {
                replaceAlias = rows[colIndex - 1].alias
                previousAlias = rowLoadRecord[index - 1]
                nextAlias = rowLoadRecord[index + 1]
            }
            if (nextAlias !== 'undefined' && replaceAlias !== nextAlias) {
                for (let i = 0, len = colLoadRecord.length - 1; i < len; i++) {
                    let sign = colLoadRecord[i] + '_' + colLoadRecord[i + 1] +
                        '_' +
                        previousAlias + '_' + alias
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign)

                        sign = colLoadRecord[i] + '_' + colLoadRecord[i + 1] +
                            '_' +
                            previousAlias + '_' + replaceAlias
                        regionLoadRecord.set(sign, true)
                    }
                }
            }
            if (previousAlias !== 'undefined') {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = previousAlias + '_' + alias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign)

                        sign = previousAlias + '_' + replaceAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                        regionLoadRecord.set(sign, true)
                    }
                }
            }
        }
    },
    [actionTypes.ROWS_GENERAT]({
        state,
        rootState,
        commit
    }, num) {
        let currentSheet = rootState.currentSheet
        let rowList = state[currentSheet].list
        let lastRow = rowList[rowList.length - 1]
        let currentTop = lastRow.top + lastRow.height + 1
        let currentSort = lastRow.sort + 1
        let initHeight = config.rowHeight
        let temp = []
        for (let i = 0; i < num; i++) {
            temp.push(extend({}, template, {
                alias: generator.rowAliasGenerator(),
                top: currentTop + (initHeight + 1) * i,
                sort: currentSort + i,
                displayName: getRowDisplayName(currentSort + i)
            }))
        }
        commit(mutationTypes.ADD_ROW, {
            rows: temp,
            currentSheet
        })
    },
    [actionTypes.ROWS_UPDATEACTIVEROWS]({
        getters,
        rootState,
        commit
    }, {
        oldStartAlias,
        newStartAlias,
        oldEndAlias,
        newEndAlias
    }) {
        let currentSheet = rootState.currentSheet
        let startIndex = getters.rowIndexByAlias(oldStartAlias)
        let endIndex = getters.rowIndexByAlias(oldEndAlias)
        endIndex = endIndex === 'MAX' ? getters.rowList.length - 1 : endIndex

        commit(mutationTypes.CANCEL_ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        })

        startIndex = getters.rowIndexByAlias(newStartAlias)
        endIndex = getters.rowIndexByAlias(newEndAlias)
        endIndex = endIndex === 'MAX' ? getters.rowList.length - 1 : endIndex

        commit(mutationTypes.ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        })
    },
    [actionTypes.ROWS_OPERROWS]({
        getters,
        state,
        rootState,
        commit
    }, payload) {
        let {
            startIndex,
            endIndex,
            props
        } = payload
        if (typeof startIndex === 'undefined') {
            let select = getters.selectByType(SELECT)
            startIndex = getters.rowIndexByAlias(select.wholePosi.startRowAlias)
            endIndex = getters.rowIndexByAlias(select.wholePosi.endRowAlias)
        }
        endIndex = endIndex == null ? startIndex : endIndex

        let updateRowInfo = []
        let rows = getters.allRows

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateRowInfo.push({
                row: rows[i],
                props: {
                    props
                }
            })
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
    }
}