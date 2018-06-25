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


export default {
    [actionTypes.ROWS_ADDROWS]({
        state,
        rootState,
        commit
    }, rows) {
        let temp = []
        for (let i = 0, len = rows.length; i < len; i++) {
            temp.push(extend({}, template, rows[i]))
        }
        commit(mutationTypes.ADD_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.ROWS_RESTOREROWS]({
        state,
        rootState,
        commit
    }, rows) {
        let map = state[rootState.currentSheet].map
        let temp = []

        for (let i = 0, len = rows.length; i < len; i++) {
            if (!map.get(rows[i].alias)) {
                temp.push(extend({}, template, rows[i]))
            }
        }
        commit(mutationTypes.INSERT_ROW, {
            rows: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.ROWS_HIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

        if (getters.visibleRowList.length < 2) {
            return
        }
        if (index == null) {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias)
        }
        let rows = getters.rowList
        let visibleRows = getters.visibleRowList
        let row = rows[index]
        let updateCellInfo = []
        let rowHeight = row.height
        let rowAlias = row.alias


        let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row

            if (occupy.indexOf(rowAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height -
                                rowHeight - 1
                        }
                    }
                })
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []
        let rowTop = row.top

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let rowSort = row.sort
            let endVisibleSort = visibleRows[visibleRows.length - 1].sort

            let startSort = getters.getRowByAlias(wholePosi.startRowAlias)
                .sort
            let endSort = getters.getRowByAlias(wholePosi.endRowAlias).sort

            if (startSort >= rowSort) {
                if (startSort === endVisibleSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                top: rows[index - 1].top,
                                height: rows[index - 1].height
                            },
                            wholePosi: {
                                startRowAlias: rows[index - 1].alias,
                                endRowAlias: rows[index - 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_ROW, {
                        currentSheet,
                        startIndex: index - 1
                    })
                } else if (startSort === endSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: rows[index + 1].height
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias,
                                endRowAlias: rows[index + 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_ROW, {
                        currentSheet,
                        startIndex: index + 1
                    })
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: select.physicsBox.height -
                                    rowHeight - 1
                            }
                        }
                    })
                }

            } else if (endSort > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top -
                                rowHeight - 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
    },
    [actionTypes.ROWS_CANCELHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let rows = getters.rowList
        let visibleRows = getters.visibleRowList

        if (index == null) {
            let select
            let startIndex
            let endIndex
            let visibleStartRow = visibleRows[0]
            let visibleEndRow = visibleRows[visibleRows.length - 1]

            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            let startRowAlias = select.wholePosi.startRowAlias
            let endRowAlias = select.wholePosi.endRowAlias
            if (visibleStartRow.alias === startRowAlias &&
                visibleStartRow !== rows[0]) {
                index = 0
            } else if (visibleEndRow.alias === endRowAlias &&
                visibleEndRow !== rows[rows.length - 1]) {
                index = rows.length - 1
            } else {
                startIndex = getters.getColIndexByAlias(startRowAlias)
                endIndex = getters.getColIndexByAlias(endRowAlias)

                for (let i = startIndex; i < endIndex + 1; i++) {
                    if (rows[i].hidden) {
                        index = i
                        break
                    }
                }
            }

        }
        if (index == null || !rows[index].hidden) {
            return
        }

        let row = rows[index]
        let updateCellInfo = []
        let rowHeight = row.height
        let rowAlias = row.alias

        let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row

            if (occupy.indexOf(rowAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            height: cell.physicsBox.height +
                                rowHeight + 1
                        }
                    }
                })
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi

            let startIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            let endIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)

            if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
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
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
    },
    [actionTypes.ROWS_INSERTROWS]({
        state,
        rootState,
        commit,
        getters
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet
        if (index == null) {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias)
        }

        let row = extend(template)
        let rows = getters.rowList
        let cellList
        let updateCellInfo = []
        let rowHeight = row.height
        let originalRowAlias = rows[index].alias
        let rowAlias = generator.rowAliasGenerator()
        let rowTop = rows[index].top


        row.sort = index
        row.alias = rowAlias
        row.displayName = getRowDisplayName(index)
        row.top = rowTop

        cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row
            if (cell.physicsBox.top >= rowTop) {
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
                let index = occupy.indexOf(originalRowAlias)
                let newOccupy = occupy.slice(0)
                newOccupy.splice(index, 0, rowAlias)

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
            }
        })

        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getRowByAlias(wholePosi.startRowAlias)
                .top
            let endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top

            if (startPosi >= rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                rowHeight + 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
            currentSheet,
            rows: [row]
        })
    },
    [actionTypes.ROWS_ADJUSTHEIGHT]({
        state,
        rootState,
        commit,
        getters
    }, {
        index,
        height
    }) {
        let rows = getters.rowList
        let row = rows[index]
        let rowAlias = row.alias
        let adjustHeight = height - row.height
        let updateCellInfo = []

        let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row

            if (occupy.indexOf(rowAlias) !== -1) {
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let updateSelectInfo = []
        let rowTop = row.top
        let selects = getters.selectList

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi

            let startPosi = getters.getRowByAlias(wholePosi.startRowAlias)
                .top
            let endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top
            if (startPosi === rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                adjustHeight
                        }
                    }
                })
            } else if (startPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                adjustHeight
                        }
                    }
                })

            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            height: select.physicsBox.height +
                                adjustHeight
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateRowInfo = []
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i]
            if (i === index) {
                updateRowInfo.push({
                    row,
                    props: {
                        height: height,
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
    [actionTypes.ROWS_DELETEROWS]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet
        if (index == null) {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getRowIndexByAlias(select.wholePosi.startRowAlias)
        }

        let rows = getters.rowList
        let row = rows[index]
        let deleteCells = []
        let updateCellInfo = []
        let rowHeight = row.height
        let rowAlias = row.alias

        let cellList = getters.getCellsByVertical({
            startColIndex: 0,
            startRowIndex: index,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row
            let temp

            if ((temp = occupy.indexOf(rowAlias)) !== -1) {
                if (occupy.length === 1) {
                    deleteCells.push(cell)
                } else {
                    deleteCells.push({
                        col: cell.occupy.col,
                        row: [rowAlias]
                    })
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                height: cell.physicsBox.height -
                                    rowHeight - 1
                            }
                        }
                    })
                }
            } else {
                let newOccupy = occupy.slice(0).splice(temp, 1)
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            top: cell.physicsBox.top -
                                rowHeight - 1
                        },
                        occupy: {
                            row: newOccupy
                        }
                    }
                })
            }
        })

        commit(mutationTypes.DELETE_CELL_POINTINFO, {
            currentSheet,
            cells: deleteCells
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []
        let rowTop = row.top

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getRowByAlias(wholePosi.startRowAlias)
                .top
            let endPosi = getters.getRowByAlias(wholePosi.endRowAlias).top

            if (startPosi >= rowTop) {
                if (startPosi === endPosi) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: rows[index + 1].height
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias,
                                endRowAlias: rows[index + 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_ROW, {
                        currentSheet,
                        startIndex: index + 1
                    })
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                height: select.physicsBox.height -
                                    rowHeight - 1
                            },
                            wholePosi: {
                                startRowAlias: rows[index + 1].alias
                            }
                        }
                    })
                }

            } else if (endPosi > rowTop) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            top: select.physicsBox.top +
                                rowHeight + 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateRowInfo = []
        for (let i = index, len = rows.length; i < len; i++) {
            let row = rows[i]
            updateRowInfo.push({
                row,
                props: {
                    top: row.top - rowHeight - 1,
                    sort: row.sort - 1,
                    displayName: getRowDisplayName(row.sort - 1)
                }
            })
        }

        if (cache.localRowPosi > 0) {
            cache.localRowPosi -= rowHeight
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
        Vue.nextTick(function() {
            let rowRecord = cache.rowRecord
            let temp
            if ((temp = rowRecord.indexOf(rowAlias)) !== -1) {
                _updateLoadInfo(temp, getters)
                dispatch(actionTypes.OCCUPY_DELETEROW, rowAlias)
                rowRecord.splice(temp, 1)
            }
            commit(mutationTypes.DELETE_ROW, {
                currentSheet,
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
        if (cache.localRowPosi > 0) {
            cache.localRowPosi = temp[temp.length - 1].top + temp[temp.length -
                1].height
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
        let startIndex = getters.getRowIndexByAlias(oldStartAlias)
        let endIndex = getters.getRowIndexByAlias(oldEndAlias)
        endIndex = endIndex === 'MAX' ? getters.rowList.length - 1 : endIndex

        commit(mutationTypes.CANCEL_ACTIVE_ROW, {
            currentSheet,
            startIndex,
            endIndex
        })

        startIndex = getters.getRowIndexByAlias(newStartAlias)
        endIndex = getters.getRowIndexByAlias(newEndAlias)
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
    }, {
        startIndexArgs,
        endIndexArgs,
        propsArgs
    }) {
        let startIndex = startIndexArgs
        let endIndex = endIndexArgs
        let props = propsArgs
<<<<<<< HEAD
        if (startIndex == null) {
=======
        if (startIndex === 'undefined') {
>>>>>>> 3e001fc902449975b99dbac54b88150a74e5f956
            let selects = getters.selectList
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            startIndex = getters.getRowIndexByAlias(select.wholePosi.startRowAlias)
            endIndex = getters.getRowIndexByAlias(select.wholePosi.endRowAlias)
        }
        endIndex = endIndex == null ? startIndex : endIndex

        let updateRowInfo = []
        let rows = getters.rowList

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateRowInfo.push({
                row: rows[i],
                props: {
                    oprProp: props
                }
            })
        }
        commit(mutationTypes.UPDATE_ROW, updateRowInfo)
    }
}