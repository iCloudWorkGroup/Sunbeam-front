import {
    A_CELLS_ADD,
    CELLS_UPDATE,
    CELLS_UPDATE_PROP,
    COLS_OPERCOLS,
    ROWS_OPERROWS,
    OCCUPY_UPDATE,
    A_CELLS_MERGE,
    A_CELLS_DESTORY,
    A_CELLS_SPLIT,
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
    CLIP,
    SELECT
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
    [A_CELLS_ADD]({
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
            let startColIndex = getters.colIndexByAlias(occupyCols[0])
            let endColIndex = getters.colIndexByAlias(occupyCols[
                occupyCols.length - 1])
            let startRowIndex = getters.rowIndexByAlias(occupyRows[0])
            let endRowIndex = getters.rowIndexByAlias(occupyRows[
                occupyRows.length - 1])

            // 从occupy转成为单元格的盒模型属性
            // 用于处理合并单元格的情况
            let top = rows[startRowIndex].top
            let left = cols[startColIndex].left
            // 当结束列为hidden是，寻找前一个，直到最前面
            let width = endColIndex === -1 ? 'inhert' : caclWidth()
            function caclWidth() {
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
    async [CELLS_UPDATE]({
        state,
        commit,
        dispatch,
        getters
    }, {
        propName,
        propStruct,
        coordinate = false,
        border = 'none',
        line = '0'
    }) {
        let select
        if (coordinate === false) {
            let selects = getters.allSelects
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
        } else {
            select = coordinate
        }
        let data = {}
        let cellsPosi = {
            coordinate: [{
                startCol: select.signalSort.startCol,
                startRow: select.signalSort.startRow,
                endCol: select.signalSort.endCol === 'MAX' ? -1 : select.signalSort.endCol,
                endRow: select.signalSort.endRow === 'MAX' ? -1 : select.signalSort.endRow
            }]
        }
        let property = {}
        if (propStruct.hasOwnProperty('border')) {
            property = {
                direction: border,
                line: line
            }
        } else {
            // 修正参数
            let propNames
            if (propName === 'background') {
                propNames = 'color'
            } else if (propName.indexOf('align') > -1) {
                propNames = 'align'
            } else {
                propNames = propName
            }
            property = {
                [propNames]: propStruct.content[propName]
            }
        }
        data = extend(cellsPosi, property)
        await send({
            url: config.url[propName],
            body: JSON.stringify(data)
        })

        // 修正参数
        let wholePosi = select.wholePosi
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
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
                if (idx !== -1) {
                    if (!avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        commit(mutationTypes.UPDATE_CELL, {
                            idx,
                            prop: propStruct
                        })
                    }
                } else {
                    dispatch(A_CELLS_ADD, extend(template, propStruct, {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }))
                }
            }
        }
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
        let startRowIndex = getters.rowIndexByAlias(row[0])
        let startColIndex = getters.colIndexByAlias(col[0])
        let endRowIndex = getters.rowIndexByAlias(row[row.length - 1])
        let endColIndex = getters.colIndexByAlias(col[col.length - 1])
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
                        dispatch(A_CELLS_ADD, [cell])
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
                        dispatch(A_CELLS_ADD, [cell])
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
    async [A_CELLS_MERGE]({
        dispatch,
        getters
    }, coordinate = false) {
        let select
        if (coordinate === false) {
            let selects = getters.allSelects
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
        } else {
            select = coordinate
        }
        let data = {
            coordinate: [
                {
                    startCol: select.signalSort.startCol,
                    startRow: select.signalSort.startRow,
                    endCol: select.signalSort.endCol,
                    endRow: select.signalSort.endRow
                }
            ]
        }
        await send({
            url: config.url.merge,
            body: JSON.stringify(data)
        })
        let wholePosi = select.wholePosi
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        if (endRowIndex === -1 || endColIndex === -1) {
            return
        }
        let cells = getters.cellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })

        // 左上角位置的单元格，作为合并单元格的模板原型，
        // 如果没有单元格，以横向优先，竖向次之查找
        // 如果所有都没有，就按照template属性合并
        let templateCell = cells.length !== 0 ?
            extend(cells[0]) : extend(template)
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
        dispatch(A_CELLS_ADD, templateCell)
    },
    async [A_CELLS_SPLIT]({
        rootState,
        dispatch,
        getters,
        commit
    }, coordinate = false) {
        let select
        if (coordinate === false) {
            let selects = getters.allSelects

            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
        } else {
            select = coordinate
        }
        let data = {
            coordinate: [
                {
                    startCol: select.signalSort.startCol,
                    startRow: select.signalSort.startRow,
                    endCol: select.signalSort.endCol,
                    endRow: select.signalSort.endRow
                }
            ]
        }
        await send({
            url: config.url.split,
            body: JSON.stringify(data)
        })
        let wholePosi = select.wholePosi
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
                        let insertCell = extend(cell)
                        if (i !== 0 || j !== 0) {
                            insertCell.content.texts = ''
                            insertCell.content.displayTexts = ''
                            insertCell.alias = generator.cellAliasGenerator()
                        }
                        insertCell.occupy = {
                            col: [occupyCol[i]],
                            row: [occupyRow[j]]
                        }
                        insertCells.push(insertCell)
                    }
                }
            }
            dispatch(A_CELLS_DESTORY, [cell])
        })
        dispatch(A_CELLS_ADD, insertCells)
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
        let select
        if (coordinate === false) {
            let selects = getters.allSelects
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
        } else {
            select = coordinate
        }
        let values = value.split('-')
        let format = values[0]
        let express = values[1]
        // 修正参数
        let wholePosi = select.wholePosi
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        // let data = {
        //     coordinate: [{
        //         startCol: cols[startColIndex].sort,
        //         startRow: rows[startRowIndex].sort,
        //         endCol: endColIndex === 'MAX' ? -1 : cols[
        //             endColIndex].sort,
        //         endRow: endRowIndex === 'MAX' ? -1 : rows[
        //             endRowIndex].sort
        //     }],
        //     format,
        //     express
        // }

        // send({
        //     url: config.url['format'],
        //     data: JSON.stringify(data)
        // })
        let rules = parseExpress(value)
        let props = {
            content: {
                type: format,
                express
            }
        }
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
            let clipStartColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let clipStartRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let clipEndColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let clipEndRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
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
        // let getPointInfo = getters.IdxByRow
        let tempSign = {}
        let cols = getters.allCols
        let rows = getters.allRows
        let cells = getters.cells
        let updateCellInfo = []
        let insertCellList = []
        let colAlias
        let rowAlias
        let cellIdx
        for (let i = startColIndex; i <= endColIndex; i++) {
            for (let j = startRowIndex; j <= endRowIndex; j++) {
                colAlias = cols[i].alias
                rowAlias = rows[j].alias
                cellIdx = getters.IdxByRow(colAlias, rowAlias)
                if (cellIdx !== -1) {
                    let cell
                    if ((cell = cells[cellIdx]) && !tempSign[cell.alias]) {
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
        dispatch(A_CELLS_ADD, insertCellList)
        updateCellInfo.forEach((item, index) => {
            commit(mutationTypes.UPDATE_CELL, {
                idx: getters.IdxByRow(item.cell.occupy.col[0], item.cell.occupy.row[0]),
                prop: item.props
            })
        })
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
                        commit(mutationTypes.M_UPDATE_POINTS, {
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
                commit(mutationTypes.M_UPDATE_POINTS, {
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
                dispatch(A_CELLS_ADD, [insertCell])
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
                commit(mutationTypes.M_UPDATE_POINTS, {
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
            dispatch(A_CELLS_ADD, [{
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
    [A_CELLS_DESTORY]({
        getters,
        commit
    }, cells) {
        cells.forEach((cell) => {
            commit(mutationTypes.M_DESTORY_CELL, cell)
            let occupyCols = cell.occupy.col
            let occupyRows = cell.occupy.row
            let cellIdx = getters.IdxByRow(occupyCols[0], occupyRows[0])
            commit(mutationTypes.M_UPDATE_POINTS, {
                occupyCols,
                occupyRows,
                cellIdx
            })
        })
    }
}