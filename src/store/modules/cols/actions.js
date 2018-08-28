import Vue from 'vue'
import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import {
    getColDisplayName
} from '../../../util/displayname'
import generator from '../../../tools/generator'
import extend from '../../../util/extend'
import config from '../../../config'
import cache from '../../../tools/cache'
import template from './template'
import {
    SELECT
} from '../../../tools/constant'
// import send from '../../../util/send'

export default {
    /**
     * 添加列，允许批量添加
     */
    [actionTypes.COLS_ADD]({
        state,
        rootState,
        commit
    }, cols) {
        let ret = []
        for (let i = 0, len = cols.length; i < len; i++) {
            let col = cols[i]
            col.displayName = getColDisplayName(col.sort)
            if (col.alias == null) {
                col.alias = generator.colAliasGenerator()
            }
            ret.push(extend(template, col))
        }
        commit(mutationTypes.ADD_COL, {
            cols: ret
        })
    },
    [actionTypes.COLS_ACTIVE]({
        state,
        commit
    }, {
        startIndex,
        endIndex
    }) {
        commit(mutationTypes.CANCEL_ACTIVE_COL)
        commit(mutationTypes.ACTIVE_COL, {
            startIndex,
            endIndex
        })
    },
    [actionTypes.COLS_RESTORECOLS]({
        state,
        rootState,
        commit
    }, cols) {
        let map = state[rootState.currentSheet].map
        let temp = []

        for (let i = 0, len = cols.length; i < len; i++) {
            if (!map.get(cols[i].alias)) {
                temp.push(extend(template, cols[i]))
            }
        }
        commit(mutationTypes.INSERT_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.COLS_ADJUSTWIDTH]({
        dispatch,
        getters
    }, {
        index,
        width
    }) {
        let cols = getters.allCols
        let col = cols[index]
        // send({
        //     url: config.url['adjustcol'],
        //     data: JSON.stringify({
        //         col: col.sort,
        //         offset: width
        //     }),
        // })
        dispatch(actionTypes.COLS_EXECADJUSTWIDTH, {
            sort: col.sort,
            value: width
        })
    },
    [actionTypes.COLS_EXECADJUSTWIDTH]({
        state,
        rootState,
        commit,
        getters
    }, {
        sort,
        value
    }) {
        let index = getters.getColIndexBySort(sort)
        let cols = getters.allCols
        let col = cols[index]
        let colAlias = col.alias
        let adjustWidth = value - col.width
        let updateCellInfo = []
        let cells = getters.cellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: -1,
            endRowIndex: -1
        })
        cells.forEach(function(cell) {
            let occupy = cell.occupy.col
            let temp = occupy.indexOf(colAlias)
            if (temp !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                adjustWidth
                        }
                    }
                })
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                adjustWidth
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })
        let updateSelectInfo = []
        let colLeft = col.left
        let selects = getters.allSelects

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi
            let endPosi

            startPosi = getters.getColByAlias(wholePosi.startColAlias).left
            endPosi = getters.getColByAlias(wholePosi.endColAlias).left
            if (startPosi === colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                adjustWidth
                        }
                    }
                })
            } else if (startPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                adjustWidth
                        }
                    }
                })

            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                adjustWidth
                        }
                    }
                })
            }
        })

        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item.props)
        })

        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            if (i === index) {
                updateColInfo.push({
                    col,
                    props: {
                        width: value
                    }
                })
            } else {
                updateColInfo.push({
                    col,
                    props: {
                        left: col.left + adjustWidth,
                    }
                })
            }

        }

        if (cache.localColPosi > 0) {
            cache.localColPosi += adjustWidth
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    },
    [actionTypes.COLS_DELETECOL]({
        getters,
        dispatch
    }, payload) {
        let index = payload
        let selects = getters.allSelects
        if (typeof index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            if (select.wholePosi.endColAlias === 'MAX') {
                return
            }
            index = getters.colIndexByAlias(select.wholePosi.startColAlias)
        }

        let cols = getters.allCols
        let col = cols[index]
        // send({
        //     url: config.url['deletecol'],
        //     data: JSON.stringify({
        //         col: col.sort,
        //     }),
        // })
        dispatch(actionTypes.COLS_EXECDELETECOL, col.sort)
    },
    [actionTypes.COLS_EXECDELETECOL]({
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        // let currentSheet = rootState.currentSheet
        let index = getters.getColIndexBySort(sort)
        let cells = getters.cellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: -1,
            endRowIndex: -1,
        })

        let cols = getters.allCols
        let deleteCol = cols[index]
        let deleteColAlias = deleteCol.alias
        let deleteColWidth = deleteCol.width
        let updateOccupys = []
        let updateCellInfo = []

        cells.forEach(function(cell) {
            let occupyCol = cell.occupy.col
            let aliasIndex = occupyCol.indexOf(deleteColAlias)
            if (aliasIndex !== -1) {
                // 所有在被删行上的单元格
                cell.occupy.row.forEach(alias => {
                    updateOccupys.push({
                        occupyCols: [deleteColAlias],
                        occupyRows: [alias],
                    })
                })
                if (occupyCol.length === 1) {
                    dispatch(actionTypes.A_CELLS_DESTORY, [cell])
                } else {
                    let newOccupyCol = [...occupyCol]
                    newOccupyCol.splice(aliasIndex, 1)
                    updateCellInfo.push({
                        cell,
                        props: {
                            occupy: {
                                col: newOccupyCol
                            },
                            physicsBox: {
                                width: cell.physicsBox.width -
                                    deleteColWidth - 1
                            }
                        }
                    })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left -
                                deleteColWidth - 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })
        // delete
        updateOccupys.forEach((item, index) => {
            commit(mutationTypes.M_DELETE_POINTS, {
                delOccupyCols: item.occupyCols,
                delOccupyRows: item.occupyRows
            })
        })
        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let endIndex = getters.colIndexByAlias(wholePosi.endColAlias)

            if (startIndex === index) {
                if (startIndex === endIndex) {
                    if (index === cols.length - 1) {
                        updateSelectInfo.push({
                            select,
                            props: {
                                physicsBox: {
                                    width: cols[index - 1].width
                                },
                                wholePosi: {
                                    startColAlias: cols[index -
                                        1].alias,
                                    endColAlias: cols[index - 1]
                                        .alias
                                }
                            }
                        })
                        commit(mutationTypes.ACTIVE_COL, {
                            startIndex: index - 1
                        })
                    } else {
                        updateSelectInfo.push({
                            select,
                            props: {
                                physicsBox: {
                                    width: cols[index + 1].width
                                },
                                wholePosi: {
                                    startColAlias: cols[index +
                                        1].alias,
                                    endColAlias: cols[index + 1]
                                        .alias
                                }
                            }
                        })
                        commit(mutationTypes.ACTIVE_COL, {
                            startIndex: index + 1
                        })
                    }
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: select.physicsBox.width -
                                    deleteColWidth - 1
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias
                            }
                        }
                    })
                }
            } else if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left -
                                deleteColWidth - 1
                        }
                    }
                })
            } else if (endIndex === index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width -
                                cols[index + 1].width - 1
                        },
                        wholePosi: {
                            endColAlias: cols[index - 1].alias
                        }
                    }
                })
            } else if (endIndex < index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width -
                                cols[index + 1].width - 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo[0].props)

        let updateColInfo = []
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left - deleteColWidth - 1,
                    sort: col.sort - 1,
                    displayName: getColDisplayName(col.sort - 1)
                }
            })
        }

        if (cache.localColPosi > 0) {
            cache.localColPosi -= deleteColWidth + 1
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)

        Vue.nextTick(function() {
            let colRecord = cache.colRecord
            let temp
            if ((temp = colRecord.indexOf(deleteColAlias)) !== -1) {
                _updateLoadInfo(temp, getters)
                dispatch(actionTypes.OCCUPY_DELETECOL, deleteColAlias)
                colRecord.splice(temp, 1)
            }
            commit(mutationTypes.DELETE_COL, {
                index
            })
        })

        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord
            let colLoadRecord = cache.colRecord
            let rowLoadRecord = cache.rowRecord
            let cols = getters.colList
            let alias = colLoadRecord[index]
            let colIndex = getters.colIndexByAlias(alias)
            let previousAlias
            let nextAlias
            let replaceAlias

            if (index === 0) {
                replaceAlias = cols[colIndex + 1].alias
                nextAlias = colLoadRecord[1]
            } else if (index === colLoadRecord.length - 1) {
                replaceAlias = cols[colIndex - 1].alias
                previousAlias = colLoadRecord[index - 1]
            } else {
                replaceAlias = cols[colIndex - 1].alias
                previousAlias = colLoadRecord[index - 1]
                nextAlias = colLoadRecord[index + 1]
            }
            if (typeof nextAlias !== 'undefined' && replaceAlias !== nextAlias) {
                for (let i = 0, len = rowLoadRecord.length - 1; i < len; i++) {
                    let sign = alias + '_' + nextAlias + '_' +
                        rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                    if (regionLoadRecord.get(sign)) {
                        regionLoadRecord.delete(sign)

                        sign = replaceAlias + '_' + nextAlias + '_' +
                            rowLoadRecord[i] + '_' + rowLoadRecord[i + 1]
                        regionLoadRecord.set(sign, true)
                    }
                }
            }
            if (typeof previousAlias !== 'undefined') {
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
    [actionTypes.COLS_HIDE]({
        commit,
        getters,
        dispatch
    }, payload) {
        if (getters.visibleColList().length < 2) {
            return
        }
        let index = payload
        if (typeof index === 'undefined') {
            let selects = getters.allSelects
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            if (select.wholePosi.endColAlias === 'MAX') {
                return
            }
            index = getters.colIndexByAlias(select.wholePosi.startColAlias)
        }
        let cols = getters.allCols
        let col = cols[index]

        // send({
        //     url: config.url['hidecol'],
        //     data: JSON.stringify({
        //         col: col.sort
        //     }),
        // }).then(() => {
        //     let cellIdx = getters.getRowIndexBySort(col.sort)
        //     let cells = getters.cellsByVertical({
        //         startColIndex: 0,
        //         startRowIndex: cellIdx,
        //         endColIndex: -1
        //     })
        //     for (let i = 0, len = cells.length; i < len; i++) {
        //         commit(mutationTypes.UPDATE_CELL, {
        //             cell: cells[i],
        //             status: {
        //                 hidden: true
        //             }
        //         })
        //     }
        // })
        dispatch(actionTypes.COLS_EXECHIDE, col.sort)
    },
    [actionTypes.COLS_EXECHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let cols = getters.allCols
        let index = getters.getColIndexBySort(sort)
        let col = cols[index]
        let visibleCols = getters.visibleColList()
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias

        let cells = getters.cellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: -1,
            endRowIndex: -1,
        })

        cells.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                if (occupy.length === 1) {
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                width: cell.physicsBox.width -
                                colWidth - 1
                            },
                            status: {
                                hidden: true
                            }
                        }
                    })
                } else {
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                width: cell.physicsBox.width -
                                colWidth - 1
                            }
                        }
                    })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left -
                                colWidth - 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })

        let updateSelectInfo = []
        let colLeft = col.left
        let selects = getters.allSelects

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startSort
            let endSort
            let colSort = col.sort
            let endVisibleSort = visibleCols[visibleCols.length - 1].sort

            startSort = getters.getColByAlias(wholePosi.startColAlias).sort
            endSort = getters.getColByAlias(wholePosi.endColAlias).sort

            if (startSort >= colSort) {
                if (startSort === endVisibleSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                left: cols[index - 1].left,
                                width: cols[index - 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index - 1].alias,
                                endColAlias: cols[index - 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_COL, {
                        startIndex: index - 1
                    })
                } else if (startSort === endSort) {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: cols[index + 1].width
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias,
                                endColAlias: cols[index + 1].alias
                            }
                        }
                    })
                    commit(mutationTypes.ACTIVE_COL, {
                        startIndex: index + 1
                    })
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: select.physicsBox.width -
                                    colWidth - 1
                            }
                        }
                    })
                }

            } else if (endSort > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left -
                                colWidth - 1
                        }
                    }
                })
            }
        })
        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item.props)
        })

        let updateColInfo = [{
            col: cols[index],
            props: {
                hidden: true,
                active: false
            }
        }]

        if (index > 0) {
            updateColInfo.push({
                col: cols[index - 1],
                props: {
                    rightAjacentHide: true
                }
            })
        }
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left - colWidth - 1
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)

        if (cache.localColPosi > 0) {
            cache.localColPosi -= colWidth + 1
        }
    },
    [actionTypes.COLS_CANCELHIDE]({
        getters,
        dispatch
    }, payload) {
        let visibleCols = getters.visibleColList()
        let cols = getters.allCols
        let index = payload
        if (typeof index === 'undefined') {
            let selects = getters.allSelects
            let select
            let startIndex
            let endIndex
            let visibleStartCol = visibleCols[0]
            let visibleEndCol = visibleCols[visibleCols.length - 1]

            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            if (select.wholePosi.endColAlias === 'MAX') {
                return
            }
            let startColAlias = select.wholePosi.startColAlias
            let endColAlias = select.wholePosi.endColAlias

            if (visibleStartCol.alias === startColAlias &&
                visibleStartCol !== cols[0]) {
                index = 0
            } else if (visibleEndCol.alias === endColAlias &&
                visibleEndCol !== cols[cols.length - 1]) {
                index = cols.length - 1
            } else {
                startIndex = getters.colIndexByAlias(startColAlias)
                endIndex = getters.colIndexByAlias(endColAlias)
                for (let i = startIndex; i <= endIndex + 1; i++) {
                    if (cols[i].hidden) {
                        index = i
                        break
                    }
                }
            }

        }
        if (typeof index === 'undefined' || !cols[index].hidden) {
            return
        }
        let col = cols[index]
        // send({
        //     url: config.url['showcol'],
        //     data: JSON.stringify({
        //         col: col.sort
        //     })
        // })
        dispatch(actionTypes.COLS_EXECCANCELHIDE, col.sort)
    },
    [actionTypes.COLS_EXECCANCELHIDE]({
        rootState,
        commit,
        getters,
        dispatch
    }, sort) {
        let index = getters.getColIndexBySort(sort)
        let cols = getters.allCols
        let col = cols[index]
        let colWidth = col.width
        let colAlias = col.alias
        let updateCellInfo = []
        let cells = getters.cellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: -1,
            endRowIndex: -1,
        })
        console.log(cells)
        cells.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                if (occupy.length === 1) {
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                width: cell.physicsBox.width +
                                colWidth + 1
                            },
                            status: {
                                hidden: false
                            }
                        }
                    })
                } else {
                    updateCellInfo.push({
                        cell,
                        props: {
                            physicsBox: {
                                width: cell.physicsBox.width +
                                colWidth + 1
                            }
                        }
                    })
                }
            } else {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })

        let updateSelectInfo = []
        let selects = getters.allSelects

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex
            let endIndex

            startIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            endIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            if (startIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                colWidth + 1
                        }
                    }
                })
                commit(mutationTypes.UPDATE_COL, [{
                    col: cols[index],
                    props: {
                        active: true
                    }
                }])
            }
        })

        updateSelectInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_SELECT, item.props)
        })

        let updateColInfo = [{
            col: cols[index],
            props: {
                hidden: false
            }
        }]

        if (index > 0) {
            updateColInfo.push({
                col: cols[index - 1],
                props: {
                    rightAjacentHide: false
                }
            })
        }
        for (let i = index + 1, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)

        if (cache.localColPosi > 0) {
            cache.localColPosi += colWidth + 1
        }
    },
    [actionTypes.COLS_INSERTCOL]({
        getters,
        dispatch
    }, payload) {
        let index = payload
        let selects = getters.allSelects
        if (typeof index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            if (select.wholePosi.endColAlias === 'MAX') {
                return
            }
            index = getters.colIndexByAlias(select.wholePosi.startColAlias)
        }

        let sort = getters.allCols[index].sort
        // send({
        //     url: config.url['insertcol'],
        //     data: JSON.stringify({
        //         col: sort,
        //     }),
        // })
        dispatch(actionTypes.COLS_EXECINSERTCOL, {
            sort
        })
    },
    [actionTypes.COLS_EXECINSERTCOL]({
        getters,
        commit,
        dispatch,
        rootState
    }, {
        sort,
        colModel
    }) {
        let insertCol
        let cols = getters.allCols
        let index = getters.getColIndexBySort(sort)
        if (!colModel) {
            insertCol = extend(template)
            insertCol.alias = generator.colAliasGenerator()
            insertCol.sort = sort
            insertCol.displayName = getColDisplayName(sort)
            insertCol.left = cols[index].left
        } else {
            insertCol = colModel
        }
        let colWidth = insertCol.width
        let insertColAlias = insertCol.alias
        let currentColAlias = cols[index].alias
        let insertColLeft = insertCol.left
        let cells
        // let currentSheet = rootState.currentSheet

        cells = getters.cellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: -1,
            endRowIndex: -1,
        })

        let updateCellInfo = []
        cells.forEach(function(cell) {
            let occupyCol = cell.occupy.col
            if (cell.physicsBox.left >= insertColLeft) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else {
                let aliasIndex = occupyCol.indexOf(currentColAlias)
                let newOccupy = [...occupyCol]
                let occupyRow = cell.occupy.row
                let cellIndex

                newOccupy.splice(aliasIndex, 0, insertColAlias)
                cellIndex = getters.IdxByCol(occupyCol[0], occupyRow[0])
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                colWidth + 1
                        },
                        occupy: {
                            col: newOccupy
                        }
                    }
                })
                occupyRow.forEach(function(rowAlias) {
                    commit(mutationTypes.M_UPDATE_POINTS, {
                        occupyCols: newOccupy,
                        occupyRows: occupyRow,
                        cellIdx: cellIndex
                    })
                })
            }
        })
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })
        let updateSelectInfo = []
        let selects = getters.allSelects
        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex
            let endIndex
            startIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            endIndex = getters.colIndexByAlias(wholePosi.endColAlias)

            if (startIndex >= index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else if (endIndex > index) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            width: select.physicsBox.width +
                                colWidth + 1
                        }
                    }
                })
                insertCol.active = true
            }
        })
        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo[0].props)

        insertCol.left = cols[index].left
        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left + colWidth + 1,
                    sort: col.sort + 1,
                    displayName: getColDisplayName(col.sort + 1)
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
        commit(mutationTypes.INSERT_COL, {
            cols: [insertCol]
        })
        if (cache.localColPosi > 0) {
            cache.localColPosi += colWidth + 1
        }
        /**
         * 只有在删除单元格的回退操作，才会传入列对象
         * 回退操作不需要进行前一列上单元格的复制操作
         */
        if (!colModel && index > 0) {
            cells = getters.cellsByVertical({
                startColIndex: index - 1,
                startRowIndex: 0,
                endColIndex: index - 1,
                endRowIndex: 'MAX',
            })
            let insertCellList = []
            let previousAlias = cols[index - 1].alias
            cells.forEach(cell => {
                let occupyCol = cell.occupy.col
                let occupyRow = cell.occupy.row
                if (occupyCol.indexOf(previousAlias) === occupyCol.length -
                    1) {
                    occupyRow.forEach(alias => {
                        let insertCell = extend(cell)
                        insertCell.occupy = {
                            col: [insertColAlias],
                            row: [alias]
                        }
                        insertCell.content.texts = ''
                        insertCellList.push(insertCell)
                    })
                }
            })
            dispatch(actionTypes.A_CELLS_ADD, insertCellList)
        }
    },
    [actionTypes.COLS_GENERAT]({
        state,
        rootState,
        commit
    }, num) {
        let currentSheet = rootState.currentSheet
        let colList = state[currentSheet].list
        let lastCol = colList[colList.length - 1]
        let currentLeft = lastCol.left + lastCol.width + 1
        let currentSort = lastCol.sort + 1
        let initWidth = config.colWidth
        let temp = []

        for (let i = 0; i < num; i++) {
            temp.push(extend({
                alias: generator.colAliasGenerator(),
                left: currentLeft + (initWidth + 1) * i,
                sort: currentSort + i,
                displayName: getColDisplayName(currentSort + i)
            }, template))
        }
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet
        })
    },
    [actionTypes.COLS_UPDATEACTIVECOLS]({
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

        let startIndex = getters.colIndexByAlias(oldStartAlias)
        let endIndex = getters.colIndexByAlias(oldEndAlias)
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex

        commit(mutationTypes.CANCEL_ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        })

        startIndex = getters.colIndexByAlias(newStartAlias)
        endIndex = getters.colIndexByAlias(newEndAlias)
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex

        commit(mutationTypes.ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        })
    },
    [actionTypes.COLS_OPERCOLS]({
        getters,
        commit
    }, payload) {
        let {
            startIndex,
            endIndex,
            props
        } = payload
        if (typeof startIndex === 'undefined') {
            let selects = getters.selectList
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            startIndex = getters.colIndexByAlias(select.wholePosi.startColAlias)
            endIndex = getters.colIndexByAlias(select.wholePosi.endColAlias)
        }
        endIndex = endIndex == null ? startIndex : endIndex

        let updateColInfo = []
        let cols = getters.colList

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateColInfo.push({
                col: cols[i],
                props: {
                    props
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    }
}