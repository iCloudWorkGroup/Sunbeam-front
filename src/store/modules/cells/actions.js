import {
    CELLS_INSERT,
    CELLS_UPDATE,
    CELLS_UPDATE_PROP,
    COLS_OPERCOLS,
    ROWS_OPERROWS,
    OCCUPY_UPDATE,
    CELLS_MERGE,
    CELLS_DESTORY,
    CELLS_SPLIT,
    CELLS_FORMAT,
    CELLS_PASTE,
    CELLS_INNERPASTE,
    CELLS_OUTERPASTE,
    CELLS_WORDWRAP,
    SELECTS_CHANGE,
    ROWS_EXECADJUSTHEIGHT
} from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import {
    CLIP
} from '../../../tools/constant'
import {
    getTextHeight
} from '../../../tools/calcbox'
import {
    parseExpress,
    formatText,
    isNum,
    isDate
} from '../../../tools/format'
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
    [CELLS_INSERT]({
        commit,
        state,
        getters
    }, props) {
        let cells = []
        if (!Array.isArray(props)) {
            cells.push(props)
        } else {
            cells = props
        }
        cells.forEach(function(cell) {
            let cols = getters.allCols
            let rows = getters.allRows
            let fixedCell = extend(template, cell)

            // 单元格的occpuy
            let occupyCols = fixedCell.occupy.col
            let occupyRows = fixedCell.occupy.row

            // 单元格在行列中占的索引位置
            // 从哪行、列开始，结束
            let startColIndex = getters.getColIndexByAlias(occupyCols[0])
            let endColIndex = getters.getColIndexByAlias(occupyCols[
                occupyCols.length - 1])
            let startRowIndex = getters.getRowIndexByAlias(occupyRows[0])
            let endRowIndex = getters.getRowIndexByAlias(occupyRows[
                occupyRows.length - 1])

            // 从occupy转成为单元格的盒模型属性
            // 用于处理合并单元格的情况
            let top = rows[startRowIndex].top
            let left = cols[startColIndex].left
            let width = 0
            for (let i = endColIndex; i > startColIndex - 1; i--) {
                let item = cols[i]
                if (!item.hidden) {
                    width = item.left + item.width - left
                    break
                }
            }
            let height = 0
            for (let i = endRowIndex; i > startRowIndex - 1; i--) {
                let item = rows[i]
                if (!item.hidden) {
                    height = item.top + item.height - top
                    break
                }
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
            commit(mutationTypes.INSERT_CELL, fixedCell)

            // 更新坐标关系表
            commit(mutationTypes.UPDATE_POINTS, {
                occupyCols,
                occupyRows,
                cellIdx: state.list.length - 1
            })
        })
    },
    async [CELLS_UPDATE]({
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct
    }) {
        let select = getters.allSelects[0]
        await send({
            url: config.url[propName],
            body: JSON.stringify(select.signalSort)
        })

        // 修正参数参数
        let wholePosi = select.wholePosi
        let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)

        let rows = getters.allRows
        let cols = getters.allCols
        if (endRowIndex === -1) {
            endRowIndex = rows.length - 1
        }
        if (endColIndex === -1) {
            endColIndex = cols.length - 1
        }

        // 如果有对应的单元格，修改属性
        // 如果没有对应的单元格，插入单元格
        let avoidRepeat = {}
        for (let i = startColIndex, colLen = endColIndex + 1; i < colLen; i++) {
            for (let j = startRowIndex, rowLen = endRowIndex + 1; j < rowLen; j++) {
                let colAlias = cols[i].alias
                let rowAlias = rows[j].alias
                let idx = getters.IdxByRow(colAlias, rowAlias)
                if (idx !== -1 && !avoidRepeat[idx]) {
                    avoidRepeat[idx] = true
                    commit(mutationTypes.UPDATE_CELL, {
                        idx,
                        prop: propStruct
                    })
                } else {
                    dispatch(CELLS_INSERT, extend(template, propStruct, {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }))
                }
            }
        }
    },
    [CELLS_UPDATE_PROP]({
        commit,
        dispatch,
        getters
    }, {
        startColIndex,
        endColIndex,
        startRowIndex,
        endRowIndex,
        props,
        fn
    }) {
        let getPointInfo = getters.getPointInfo
        let tempSign = {}
        let cols = getters.colList
        let rows = getters.allRows
        let cells = getters.cells
        let updateCellInfo = []
        let insertCellList = []
        let colAlias
        let rowAlias
        let cellIndex

        for (let i = startColIndex; i <= endColIndex; i++) {
            for (let j = startRowIndex; j <= endRowIndex; j++) {
                colAlias = cols[i].alias
                rowAlias = rows[j].alias
                cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex')
                if (typeof cellIndex === 'number') {
                    let cell
                    if ((cell = cells[cellIndex]) && !tempSign[cell.alias]) {
                        let updateProp
                        if (fn) {
                            updateProp = extend({}, props, fn(cell))
                        } else {
                            updateProp = props
                        }
                        updateCellInfo.push({
                            cell,
                            props: updateProp
                        })
                    }
                } else {
                    let cell = extend({
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }, props)
                    insertCellList.push(cell)
                }
            }
        }

        dispatch(CELLS_INSERT, insertCellList)
        if (updateCellInfo.length > 0) {
            commit(mutationTypes.UPDATE_CELL, updateCellInfo)
        }
    },
    [COLS_OPERCOLS]({
        getters,
        state,
        rootState,
        commit,
        dispatch
    }, {
        startIndex,
        endIndex,
        props,
        fn
    }) {
        let updateCellInfo = []
        let cellList = getters.getCellsByVertical({
            startRowIndex: 0,
            endRowIndex: 'MAX',
            startColIndex: startIndex,
            endColIndex: endIndex
        })
        cellList.forEach(function(cell) {
            let updateProp
            if (fn) {
                updateProp = extend({}, props, fn(cell))
            } else {
                updateProp = props
            }
            updateCellInfo.push({
                cell,
                props: updateProp
            })
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)
        let insertCellInfo = []
        let editViewOccupy = getters.getEditViewOccupy()
        let cols = getters.colList
        let rows = getters.allRows

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let viewOccupyRow = editViewOccupy[key].row
                let startRowIndex
                let endRowIndex
                if (viewOccupyRow.length === 0) {
                    continue
                }
                startRowIndex = getters.getRowIndexByAlias(viewOccupyRow[0])
                endRowIndex = getters.getRowIndexByAlias(viewOccupyRow[
                    viewOccupyRow.length - 1])

                for (let i = startRowIndex; i < endRowIndex + 1; i++) {
                    for (let j = startIndex; j < endIndex + 1; j++) {
                        let colAlias = cols[j].alias
                        let rowAlias = rows[i].alias
                        let cellIndex = getters.getPointInfo(colAlias, rowAlias,
                            'cellIndex')
                        if (typeof cellIndex !== 'number') {
                            let cell = extend({}, props)
                            cell.occupy = {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                            insertCellInfo.push(cell)
                        }
                    }
                }
            }
        }
        dispatch(CELLS_INSERT, insertCellInfo)
    },
    [ROWS_OPERROWS]({
        getters,
        state,
        rootState,
        commit,
        dispatch
    }, {
        startIndex,
        endIndex,
        props,
        fn
    }) {
        let updateCellInfo = []

        let cellList = getters.getCellsByVertical({
            startRowIndex: startIndex,
            endRowIndex: endIndex,
            startColIndex: 0,
            endColIndex: 'MAX'
        })
        cellList.forEach(function(cell) {
            let updateProp
            if (fn) {
                updateProp = extend({}, props, fn(cell))
            } else {
                updateProp = props
            }
            updateCellInfo.push({
                cell,
                props: updateProp
            })
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let insertCellInfo = []
        let editViewOccupy = getters.getEditViewOccupy()
        let cols = getters.colList
        let rows = getters.allRows

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let viewOccupyCol = editViewOccupy[key].col
                let startColIndex
                let endColIndex

                if (viewOccupyCol.length === 0) {
                    continue
                }
                startColIndex = getters.getColIndexByAlias(viewOccupyCol[0])
                endColIndex = getters.getColIndexByAlias(viewOccupyCol[
                    viewOccupyCol.length - 1])

                for (let i = startColIndex; i < endColIndex + 1; i++) {
                    for (let j = startIndex; j < endIndex + 1; j++) {
                        let colAlias = cols[i].alias
                        let rowAlias = rows[j].alias
                        let cellIndex = getters.getPointInfo(colAlias, rowAlias,
                            'cellIndex')
                        let cell = extend({}, props)

                        cell.occupy = {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                        if (typeof cellIndex !== 'number') {
                            insertCellInfo.push(cell)
                        }
                    }
                }
            }
        }
        dispatch(CELLS_INSERT, insertCellInfo)
    },
    [OCCUPY_UPDATE]({
        commit,
        getters,
        rootState,
        dispatch
    }, {
        col,
        row
    }) {
        if (col.length === 0 || row.length === 0) {
            return
        }
        let startRowIndex = getters.getRowIndexByAlias(row[0])
        let startColIndex = getters.getColIndexByAlias(col[0])
        let endRowIndex = getters.getRowIndexByAlias(row[row.length - 1])
        let endColIndex = getters.getColIndexByAlias(col[col.length - 1])
        let cols = getters.colList
        let rows = getters.allRows
        let getPointInfo = getters.getPointInfo
        let temp

        for (let i = startRowIndex; i < endRowIndex + 1; i++) {
            if (!isEmpty(temp = rows[i].props)) {
                for (let j = startColIndex; j < endColIndex + 1; j++) {
                    let rowAlias = rows[i].alias
                    let colAlias = cols[j].alias
                    let index = getPointInfo(colAlias, rowAlias, 'cellIndex')
                    let cell = extend({}, temp)

                    cell.occupy = {
                        col: [colAlias],
                        row: [rowAlias]
                    }
                    if (typeof index !== 'number') {
                        dispatch(CELLS_INSERT, [cell])
                    }
                }
            }
        }


        for (let i = startColIndex; i < endColIndex + 1; i++) {
            if (!isEmpty(temp = cols[i].props)) {
                for (let j = startRowIndex; j < endRowIndex + 1; j++) {
                    let rowAlias = rows[j].alias
                    let colAlias = cols[i].alias
                    let index = getPointInfo(colAlias, rowAlias, 'cellIndex')
                    let cell = extend({}, temp)

                    cell.occupy = {
                        col: [colAlias],
                        row: [rowAlias]
                    }
                    if (typeof index !== 'number') {
                        dispatch(CELLS_INSERT, [cell])
                    }
                }
            }
        }

        function isEmpty(obj) {
            let content = obj.content
            if (content) {
                for (let key in content) {
                    if (Object.prototype.hasOwnProperty.call(content, key)) {
                        return false
                    }
                }
            }
            let border = obj.border
            if (border) {
                for (let key in border) {
                    if (Object.prototype.hasOwnProperty.call(border, key)) {
                        return false
                    }
                }
            }
            let customProp = obj.customProp
            if (customProp) {
                for (let key in customProp) {
                    if (Object.prototype.hasOwnProperty.call(customProp, key)) {
                        return false
                    }
                }

            }
            return true
        }
    },
    async [CELLS_MERGE]({
        dispatch,
        getters
    }) {
        let select = getters.allSelects[0]
        await send({
            url: config.url.merge,
            body: JSON.stringify(select.signalSort)
        })
        let wholePosi = select.wholePosi
        let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)

        let cells = getters.getCellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })

        // 左上角位置的单元格，作为合并单元格的模板原型，
        // 如果没有单元格，以横向优先，竖向次之查找
        // 如果所有都没有，就按照template属性合并
        let templateCell = cells != null ?
            extend(cells[0]) : extend(template)
        let cols = []
        for (let i = startColIndex; i < endColIndex + 1; i++) {
            cols.push(getters.colList[i].alias)
        }
        let rows = []
        for (let i = startRowIndex; i < endRowIndex + 1; i++) {
            rows.push(getters.allRows[i].alias)
        }
        templateCell.occupy = {
            row: rows,
            col: cols
        }
        dispatch(CELLS_DESTORY, cells)
        dispatch(CELLS_INSERT, templateCell)
    },
    [CELLS_SPLIT]({
        rootState,
        dispatch,
        getters,
        commit
    }, {
        startColIndex,
        endColIndex,
        startRowIndex,
        endRowIndex
    }) {
        let cellList = getters.getCellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })

        let insertCellList = []

        cellList.forEach(cell => {
            let occupyCol = cell.occupy.col
            let occupyRow = cell.occupy.row
            if (occupyRow.length > 1 || occupyCol.length > 1) {
                for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
                    for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
                        let insertCell = extend(cell)
                        if (i !== 0 || j !== 0) {
                            insertCell.content.texts = ''
                        }
                        insertCell.occupy = {
                            col: [occupyCol[i]],
                            row: [occupyRow[j]]
                        }
                        insertCellList.push(insertCell)
                    }
                }
            }
        })
        dispatch(CELLS_INSERT, insertCellList)
    },
    [CELLS_FORMAT]({
        commit,
        getters,
        rootState,
        dispatch
    }, value) {
        let {
            startColIndex,
            startRowIndex,
            endColIndex,
            endRowIndex
        } = getters.getOprRegion
        let cols = getters.colList
        let rows = getters.allRows
        let values = value.split('-')
        let format = values[0]
        let express = values[1]

        let data = {
            coordinate: [{
                startCol: cols[startColIndex].sort,
                startRow: rows[startRowIndex].sort,
                endCol: endColIndex === 'MAX' ? -1 : cols[
                    endColIndex].sort,
                endRow: endRowIndex === 'MAX' ? -1 : rows[
                    endRowIndex].sort
            }],
            format,
            express
        }
        send({
            url: config.url['format'],
            data: JSON.stringify(data)
        })
        let rules = parseExpress(value)
        let props = {
            content: {
                type: format,
                express
            }
        }
        if (endRowIndex === 'MAX') {
            dispatch(COLS_OPERCOLS, {
                startIndex: startColIndex,
                endIndex: endColIndex,
                fn: parseText,
                props
            })
        } else if (endColIndex === 'MAX') {
            dispatch(ROWS_OPERROWS, {
                startIndex: startRowIndex,
                endIndex: endRowIndex,
                fn: parseText,
                props
            })
        } else {
            dispatch(CELLS_UPDATE_PROP, {
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex,
                props,
                fn: parseText
            })
        }

        function parseText(cell) {
            let text = cell.content.texts
            if (format === 'date' && isDate(text)) {
                text = formatText(rules, text)
            } else if (format !== 'date' && isNum(text)) {
                text = formatText(rules, parseFloat(text, 10))
            }
            return {
                content: {
                    displayTexts: text
                }
            }
        }
    },
    [CELLS_PASTE]({
        getters,
        dispatch
    }, text) {
        let {
            startColIndex,
            startRowIndex
        } = getters.getOprRegion
        let cols = getters.colList
        let rows = getters.allRows
        let startRowSort = rows[startRowIndex].sort
        let startColSort = cols[startColIndex].sort
        if (typeof text !== 'undefined') {
            send({
                url: config.url['outerpaste'],
                data: JSON.stringify({
                    oprCol: startColSort,
                    oprRow: startRowSort,
                    content: text
                }),
                success(data) {
                    if (data.isLegal) {
                        dispatch(CELLS_OUTERPASTE, {
                            startRowSort,
                            startColSort,
                            parseDate: parseClipStr(text)
                        })
                    }
                }
            })
        } else {
            let clip
            let selects = getters.selectList
            for (let i = 0, len = selects.length; i < len; i++) {
                let item = selects[i]
                if (item.type === CLIP) {
                    clip = item
                }
            }
            if (!clip) {
                return
            }
            let wholePosi = clip.wholePosi
            let clipStartColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            let clipStartRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            let clipEndColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            let clipEndRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
            send({
                url: config.url[cache.clipState],
                data: JSON.stringify({
                    orignal: {
                        startCol: cols[clipStartColIndex].sort,
                        startRow: rows[clipStartRowIndex].sort,
                        endCol: cols[clipEndColIndex].sort,
                        endRow: rows[clipEndRowIndex].sort
                    },
                    target: {
                        oprCol: startColSort,
                        oprRow: startRowSort
                    }
                }),
                success(data) {
                    if (data.isLegal) {
                        dispatch(CELLS_INNERPASTE, {
                            startRowSort,
                            startColSort,
                            clipStartColSort: cols[
                                clipStartColIndex].sort,
                            clipStartRowSort: rows[
                                clipStartRowIndex].sort,
                            clipEndColSort: cols[
                                clipEndColIndex].sort,
                            clipEndRowSort: rows[
                                clipEndRowIndex].sort
                        })
                    }
                }
            })
        }
    },
    [CELLS_INNERPASTE]({
        state,
        dispatch,
        getters,
        commit,
        rootState
    }, payload) {
        let {
            startRowSort,
            startColSort,
            clipStartColSort,
            clipStartRowSort,
            clipEndColSort,
            clipEndRowSort
        } = payload
        let currentSheet = rootState.currentSheet
        let cols = getters.colList
        let rows = getters.allRows
        let startColIndex = getters.getColIndexBySort(startColSort)
        let startRowIndex = getters.getRowIndexBySort(startRowSort)
        let clipStartColIndex = getters.getColIndexBySort(clipStartColSort)
        let clipStartRowIndex = getters.getRowIndexBySort(clipStartRowSort)
        let clipEndColIndex = getters.getColIndexBySort(clipEndColSort)
        let clipEndRowIndex = getters.getRowIndexBySort(clipEndRowSort)
        let cacheInfo = []
        let colRelative = 0
        let rowRelative = 0
        let temp = {}
        for (let i = clipStartColIndex; i < clipEndColIndex + 1; i++) {
            rowRelative = 0
            for (let j = clipStartRowIndex; j < clipEndRowIndex + 1; j++) {
                let aliasCol = cols[i].alias
                let aliasRow = rows[j].alias
                let cellIndex = getters.getPointInfo(aliasCol, aliasRow,
                    'cellIndex')
                if (cellIndex != null && !temp[cellIndex]) {
                    temp[cellIndex] = true
                    cacheInfo.push({
                        colRelative,
                        rowRelative,
                        cellIndex
                    })
                    if (cache.clipState === 'cut') {
                        commit(mutationTypes.UPDATE_POINTS, {
                            currentSheet,
                            info: {
                                colAlias: aliasCol,
                                rowAlias: aliasRow,
                                type: 'cellIndex',
                                value: null
                            }
                        })
                    }
                }
                rowRelative++
            }
            colRelative++
        }
        let endColIndex = startColIndex + clipEndColIndex - clipStartColIndex
        let endRowIndex = startRowIndex + clipEndRowIndex - clipStartRowIndex

        // 过滤超出加载区域部分
        endColIndex = endColIndex < cols.length - 1 ? endColIndex : cols.length -
            1
        endRowIndex = endRowIndex < rows.length - 1 ? endRowIndex : rows.length -
            1

        for (let i = startColIndex; i < endColIndex + 1; i++) {
            for (let j = startRowIndex; j < endRowIndex + 1; j++) {
                let aliasCol = cols[i]
                let aliasRow = rows[j]
                commit(mutationTypes.UPDATE_POINTS, {
                    currentSheet,
                    info: {
                        colAlias: aliasCol,
                        rowAlias: aliasRow,
                        type: 'cellIndex',
                        value: null
                    }
                })
            }
        }
        let cells = getters.cells
        for (let i = 0, len = cacheInfo.length; i < len; i++) {
            let item = cacheInfo[i]
            let cell = cells[item.cellIndex]
            let insertCell = extend(cell)
            let currentOccupyCol = insertCell.occupy.col
            let currentOccupyRow = insertCell.occupy.row
            let occupyCol = []
            let occupyRow = []
            for (let j = 0, len = currentOccupyCol.length; j < len; j++) {
                if (startColIndex + item.colRelative + j < cols.length) {
                    occupyCol.push(cols[startColIndex + item.colRelative + j].alias)
                }
            }
            for (let j = 0, len = currentOccupyRow.length; j < len; j++) {
                if (startRowIndex + item.rowRelative + j < rows.length) {
                    occupyRow.push(rows[startRowIndex + item.rowRelative + j].alias)
                }
            }
            if (occupyCol.length > 0 && occupyRow.length > 0) {
                insertCell.occupy = {
                    col: occupyCol,
                    row: occupyRow
                }
                dispatch(CELLS_INSERT, [insertCell])
            }
        }
        destoryClip()
        adaptSelect()

        function destoryClip() {
            let flag = true
            if (cache.clipState !== 'cut' &&
                (startRowIndex > clipEndRowIndex ||
                    endRowIndex < clipStartRowIndex ||
                    startColIndex > clipEndColIndex ||
                    endColIndex < clipStartColIndex)
            ) {
                flag = false
            }
            if (flag) {
                let clip
                let selects = getters.selectList
                for (let i = 0, len = selects.length; i < len; i++) {
                    let select = selects[i]
                    if (select.type === CLIP) {
                        clip = select
                        break
                    }
                }
                cache.clipState = ''
                commit(mutationTypes.DELETE_SELECT, {
                    currentSheet,
                    select: clip
                })
            }
        }

        function adaptSelect() {
            dispatch(SELECTS_CHANGE, {
                startRowIndex,
                startColIndex,
                endRowIndex,
                endColIndex
            })
        }
    },
    [CELLS_OUTERPASTE]({
        state,
        dispatch,
        getters,
        commit,
        rootState
    }, payload) {
        let {
            startRowSort,
            startColSort,
            parseDate
        } = payload
        let currentSheet = rootState.currentSheet
        let cols = getters.colList
        let rows = getters.allRows
        let startColIndex = getters.getColIndexBySort(startColSort)
        let startRowIndex = getters.getRowIndexBySort(startRowSort)
        let colLen = parseDate.colLen
        let rowLen = parseDate.rowLen

        // 清除复制选中区
        if (cache.clipState !== '') {
            let clip
            let selects = getters.selectList
            for (let i = 0, len = selects.length; i < len; i++) {
                let select = selects[i]
                if (select.type === CLIP) {
                    clip = select
                    break
                }
            }
            cache.clipState = ''
            commit(mutationTypes.DELETE_SELECT, {
                currentSheet,
                select: clip
            })
        }
        let endColIndex = startColIndex + colLen - 1
        let endRowIndex = startRowIndex + rowLen - 1

        // 过滤超出加载区域部分
        endColIndex = endColIndex < cols.length - 1 ? endColIndex : cols.length -
            1
        endRowIndex = endRowIndex < rows.length - 1 ? endRowIndex : rows.length -
            1
        for (let i = startColIndex; i < endColIndex + 1; i++) {
            for (let j = startRowIndex; j < endRowIndex + 1; j++) {
                let aliasCol = cols[i]
                let aliasRow = rows[j]
                commit(mutationTypes.UPDATE_POINTS, {
                    currentSheet,
                    info: {
                        colAlias: aliasCol,
                        rowAlias: aliasRow,
                        type: 'cellIndex',
                        value: null
                    }
                })
            }
        }
        let parseCellData = parseDate.data
        parseCellData.forEach(cellData => {
            if (cellData.colRelative + startColIndex > cols.length - 1 ||
                cellData.rowRelative + startRowIndex > rows.length - 1) {
                return
            }
            let colAlias = cols[cellData.colRelative + startColIndex].alias
            let rowAlias = rows[cellData.rowRelative + startRowIndex].alias
            dispatch(CELLS_INSERT, [{
                occupy: {
                    col: [colAlias],
                    row: [rowAlias]
                },
                content: {
                    texts: cellData.text,
                    displayTexts: cellData.text
                }
            }])
        })
        dispatch(SELECTS_CHANGE, {
            startRowIndex,
            startColIndex,
            endRowIndex,
            endColIndex
        })
    },
    [CELLS_WORDWRAP]({
        dispatch,
        getters
    }, payload) {
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
            let region = getters.getOprRegion
            startColIndex = region.startColIndex
            startRowIndex = region.startRowIndex
            endRowIndex = region.endRowIndex
            endColIndex = region.endColIndex
        }
        let value
        let cell = getters.getCellsByVertical({
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
        if (endRowIndex === 'MAX') {
            dispatch(COLS_OPERCOLS, {
                startIndex: startColIndex,
                endIndex: endColIndex,
                props
            })
        } else if (endColIndex === 'MAX') {
            dispatch(ROWS_OPERROWS, {
                startIndex: startRowIndex,
                endIndex: endRowIndex,
                props
            })
        } else {
            if (value) {
                oprRows = getAdaptRows()
            }
            dispatch(CELLS_UPDATE_PROP, {
                startColIndex,
                startRowIndex,
                endColIndex,
                endRowIndex,
                props
            })
            if (oprRows) {
                oprRows.forEach(info => {
                    dispatch(ROWS_EXECADJUSTHEIGHT, {
                        sort: info.sort,
                        value: info.height
                    })
                })
            }
        }

        function getAdaptRows() {
            let cols = getters.colList
            let rows = getters.allRows
            let cells = getters.cells
            let getPointInfo = getters.getPointInfo
            let temp = {}
            let oprRows = []
            for (let i = startRowIndex; i < endRowIndex + 1; i++) {
                let maxHeight = 0
                let rowAlias = rows[i].alias
                for (let j = startColIndex; j < endColIndex + 1; j++) {
                    let colAlias = cols[j].alias
                    let cellIndex = getPointInfo(colAlias, rowAlias,
                        'cellIndex')
                    if (typeof cellIndex === 'number' && !temp[cellIndex]) {
                        let cell = cells[cellIndex]
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
                        sort: rows[i].sort,
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
    [CELLS_DESTORY]({
        getters,
        commit
    }, cells) {
        cells.forEach((cell) => {
            commit(mutationTypes.DESTORY_CELL, cell)
            let occupyCols = cell.occupy.col
            let occupyRows = cell.occupy.row
            let cellIdx = getters.IdxByRow(occupyCols[0], occupyRows[0])
            commit(mutationTypes.UPDATE_POINTS, {
                occupyCols,
                occupyRows,
                cellIdx
            })
        })
    }
}