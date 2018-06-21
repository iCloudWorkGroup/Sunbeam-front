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

export default {
    [actionTypes.COLS_ADDCOLS]({
        state,
        rootState,
        commit
    }, cols) {
        let temp = []
        for (let i = 0, len = cols.length; i < len; i++) {
            temp.push(extend({}, template, cols[i]))
        }
        commit(mutationTypes.ADD_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
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
                temp.push(extend({}, template, cols[i]))
            }
        }
        commit(mutationTypes.INSERT_COL, {
            cols: temp,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.COLS_ADJUSTWIDTH]({
        state,
        rootState,
        commit,
        getters
    }, {
        index,
        width
    }) {
        let cols = getters.colList
        let col = cols[index]
        let adjustWidth = width - col.width
        let updateCellInfo = []
        let colAlias = col.alias

        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.row

            if (occupy.indexOf(colAlias) !== -1) {
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let updateSelectInfo = []
        let colLeft = col.left
        let selects = getters.selectList

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

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            if (i === index) {
                updateColInfo.push({
                    col,
                    props: {
                        width
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
    [actionTypes.COLS_DELETECOLS]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

        if (index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let cols = getters.colList
        let col = cols[index]
        let deleteCells = []
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias

        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col
            let temp

            if ((temp = occupy.indexOf(colAlias)) !== -1) {
                if (occupy.length === 1) {
                    deleteCells.push(cell)
                } else {
                    deleteCells.push({
                        col: [colAlias],
                        row: cell.occupy.row
                    })
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
                let newOccupy = occupy.slice(0)
                newOccupy.splice(temp, 1)

                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            left: cell.physicsBox.left -
                                colWidth - 1
                        },
                        occupy: {
                            col: newOccupy
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
        let colLeft = col.left

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getColByAlias(wholePosi.startColAlias)
                .left
            let endPosi = getters.getColByAlias(wholePosi.endColAlias).left


            if (startPosi >= colLeft) {
                if (startPosi === endPosi) {
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
                        currentSheet,
                        startIndex: index + 1
                    })
                } else {
                    updateSelectInfo.push({
                        select,
                        props: {
                            physicsBox: {
                                width: select.physicsBox.width -
                                    colWidth - 1
                            },
                            wholePosi: {
                                startColAlias: cols[index + 1].alias
                            }
                        }
                    })
                }

            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

        let updateColInfo = []
        for (let i = index, len = cols.length; i < len; i++) {
            let col = cols[i]
            updateColInfo.push({
                col,
                props: {
                    left: col.left - colWidth - 1,
                    sort: col.sort - 1,
                    displayName: getColDisplayName(col.sort - 1)
                }
            })
        }

        if (cache.localColPosi > 0) {
            cache.localColPosi -= colWidth
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
        Vue.nextTick(function() {
            let colRecord = cache.colRecord
            let temp
            if ((temp = colRecord.indexOf(colAlias)) !== -1) {
                _updateLoadInfo(temp, getters)
                dispatch(actionTypes.OCCUPY_DELETECOL, colAlias)
                colRecord.splice(temp, 1)
            }
            commit(mutationTypes.DELETE_COL, {
                currentSheet,
                index
            })
        })

        function _updateLoadInfo(index, getters) {
            let regionLoadRecord = cache.regionRecord
            let colLoadRecord = cache.colRecord
            let rowLoadRecord = cache.rowRecord
            let cols = getters.colList
            let alias = colLoadRecord[index]
            let colIndex = getters.getColIndexByAlias(alias)
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
            if (nextAlias !== 'undefined' && replaceAlias !== nextAlias) {
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
    [actionTypes.COLS_HIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

        if (getters.visibleColList.length < 2) {
            return
        }
        if (index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let cols = getters.colList
        let visibleCols = getters.visibleColList
        let col = cols[index]
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias


        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width -
                                colWidth - 1
                        }
                    }
                })
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []
        let colLeft = col.left

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
                        currentSheet,
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
                        currentSheet,
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

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
    },
    [actionTypes.COLS_CANCELHIDE]({
        state,
        rootState,
        commit,
        getters,
        dispatch
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let cols = getters.colList
        let visibleCols = getters.visibleColList

        if (index === 'undefined') {
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
            let startColAlias = select.wholePosi.startColAlias
            let endColAlias = select.wholePosi.endColAlias
            if (visibleStartCol.alias === startColAlias &&
                visibleStartCol !== cols[0]) {
                index = 0
            } else if (visibleEndCol.alias === endColAlias &&
                visibleEndCol !== cols[cols.length - 1]) {
                index = cols.length - 1
            } else {
                startIndex = getters.getColIndexByAlias(startColAlias)
                endIndex = getters.getColIndexByAlias(endColAlias)

                for (let i = startIndex; i < endIndex + 1; i++) {
                    if (cols[i].hidden) {
                        index = i
                        break
                    }
                }
            }

        }
        if (index === 'undefined' || !cols[index].hidden) {
            return
        }

        let col = cols[index]
        let updateCellInfo = []
        let colWidth = col.width
        let colAlias = col.alias

        let cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (occupy.indexOf(colAlias) !== -1) {
                updateCellInfo.push({
                    cell,
                    props: {
                        physicsBox: {
                            width: cell.physicsBox.width +
                                colWidth + 1
                        }
                    }
                })
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
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startIndex
            let endIndex

            startIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            endIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
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

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
    },
    [actionTypes.COLS_INSERTCOLS]({
        state,
        rootState,
        commit,
        getters
    }, indexArgs) {
        let index = indexArgs
        let selects = getters.selectList
        let currentSheet = rootState.currentSheet

        if (index === 'undefined') {
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            index = getters.getColIndexByAlias(select.wholePosi.startColAlias)
        }

        let col = extend(template)
        let cols = getters.colList
        let getPointInfo = getters.getPointInfo
        let cellList
        let updateCellInfo = []
        let originalColAlias = cols[index]
        let colWidth = col.width
        let colAlias = generator.colAliasGenerator()
        let colLeft = cols[index].left

        col.sort = index
        col.alias = colAlias
        col.displayName = getColDisplayName(index)
        col.left = colLeft

        cellList = getters.getCellsByVertical({
            startColIndex: index,
            startRowIndex: 0,
            endColIndex: 'MAX',
            endRowIndex: 'MAX',
        })

        cellList.forEach(function(cell) {
            let occupy = cell.occupy.col

            if (cell.physicsBox.left >= colLeft) {
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
                let index = occupy.indexOf(originalColAlias)
                let newOccupy = occupy.slice(0)
                let occupyRow = cell.occupy.row
                let cellIndex

                newOccupy.splice(index, 0, colAlias)
                cellIndex = getPointInfo(occupy[0], occupyRow[0],
                    'cellIndex')

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
                    commit(mutationTypes.UPDATE_POINTINFO, {
                        currentSheet,
                        info: {
                            colAlias,
                            rowAlias,
                            type: 'cellIndex',
                            value: cellIndex
                        }
                    })
                })
            }
        })

        commit(mutationTypes.UPDATE_CELL, updateCellInfo)


        let updateSelectInfo = []

        selects.forEach(function(select) {
            let wholePosi = select.wholePosi
            let startPosi = getters.getColByAlias(wholePosi.startColAlias)
                .left
            let endPosi = getters.getColByAlias(wholePosi.endColAlias).left

            if (startPosi >= colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            } else if (endPosi > colLeft) {
                updateSelectInfo.push({
                    select,
                    props: {
                        physicsBox: {
                            left: select.physicsBox.left +
                                colWidth + 1
                        }
                    }
                })
            }
        })

        commit(mutationTypes.UPDATE_SELECT, updateSelectInfo)

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
            currentSheet,
            cols: [col]
        })
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
            temp.push(extend({}, template, {
                alias: generator.colAliasGenerator(),
                left: currentLeft + (initWidth + 1) * i,
                sort: currentSort + i,
                displayName: getColDisplayName(currentSort + i)
            }))
        }

        if (cache.localColPosi > 0) {
            cache.localColPosi = temp[temp.length - 1].left + temp[temp.length -
                1].width
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

        let startIndex = getters.getColIndexByAlias(oldStartAlias)
        let endIndex = getters.getColIndexByAlias(oldEndAlias)
        endIndex = endIndex === 'MAX' ? getters.colList.length - 1 : endIndex

        commit(mutationTypes.CANCEL_ACTIVE_COL, {
            currentSheet,
            startIndex,
            endIndex
        })

        startIndex = getters.getColIndexByAlias(newStartAlias)
        endIndex = getters.getColIndexByAlias(newEndAlias)
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
    }, {
        startIndexArgs,
        endIndexArgs,
        propsArgs
    }) {
        let startIndex = startIndexArgs
        let endIndex = endIndexArgs
        let props = propsArgs
        if (startIndex === 'undefined') {
            let selects = getters.selectList
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            startIndex = getters.getColIndexByAlias(select.wholePosi.startColAlias)
            endIndex = getters.getColIndexByAlias(select.wholePosi.endColAlias)
        }
        endIndex = endIndex === 'undefined' ? startIndex : endIndex

        let updateColInfo = []
        let cols = getters.colList

        for (let i = startIndex; i < endIndex + 1; i++) {
            updateColInfo.push({
                col: cols[i],
                props: {
                    oprProp: props
                }
            })
        }
        commit(mutationTypes.UPDATE_COL, updateColInfo)
    }
}