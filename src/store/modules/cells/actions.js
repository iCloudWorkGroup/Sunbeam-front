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
    isNum,
    isDate, parseType,
    parsePropStruct
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
    A_CELLS_ADD({
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
            let fixedCell = extend(template, rowProp)
            fixedCell = extend(fixedCell, colProp)
            fixedCell = extend(fixedCell, cell)
            // // 单元格的occpuy
            // let occupyCols = fixedCell.occupy.col
            // let occupyRows = fixedCell.occupy.row
            // 修正参数
            // endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
            // endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
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
            getters.selectByType(SELECT) : {}
        let wholePosi = coordinate === false ?
            select.wholePosi :
            coordinate
        let rows = getters.allRows
        let cols = getters.allCols
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let signalSort = coordinate === false ? select.signalSort : {
            startCol: cols[startColIndex].sort,
            startRow: rows[startRowIndex].sort,
            endCol: cols[endColIndex] ? cols[endColIndex].sort : -1,
            endRow: rows[endRowIndex] ? rows[endRowIndex].sort : -1
        }
        let sendArgs = {
            coordinate: [signalSort]
        }
        let fixPropName = propName
        let direction
        let txt
        switch (propName) {
            case 'wordWrap':
                sendArgs = extend(sendArgs, {
                    auto: propStruct.content[propName]
                })
                if (propStruct.row) {
                    sendArgs = extend(sendArgs, {
                        effect: [{
                            row: propStruct.row.index,
                            offset: propStruct.row.height
                        }]
                    })
                }
                break
            case 'texts':
                txt = fixText(propStruct.content[propName])
                sendArgs = extend({
                    coordinate: signalSort
                }, {
                    content: txt
                })
                break
            case 'border.top':
            case 'border.right':
            case 'border.bottom':
            case 'border.left':
            case 'border.all':
            case 'border.none':
                fixBorder()
                break
            case 'alignRow':
            case 'alignCol':
                sendArgs = extend(sendArgs, {
                    align: propStruct.content[propName]
                })
                break
            case 'background':
                sendArgs = extend(sendArgs, {
                    color: propStruct.content[propName]
                })
                break
            case 'comment':
                sendArgs = extend(sendArgs, {
                    [propName]: propStruct.customProp[propName]
                })
                break
            case 'recomment':
                sendArgs = extend(sendArgs)
                break
            default:
                sendArgs = extend(sendArgs, {
                    [propName]: propStruct.content[propName]
                })
                break
        }
        function fixText(text) {
            let txt = text
            if (propStruct.content.express === '$#,##0.00' && isNum(txt)) {
                txt = '$' + txt
            }
            if (propStruct.content.express === '¥#,##0.00' && isNum(txt)) {
                txt = '¥' + txt
            }
            if (propStruct.content.express === '0.00%' && isNum(txt)) {
                txt = txt * 100 + '%'
            }
            return txt
        }
        function fixBorder() {
            fixPropName = 'border'
            direction = propName.split('.')[1]
            let line = direction === 'all' || direction === 'none' ?
                propStruct.border.top :
                propStruct.border[direction]
            sendArgs = extend(sendArgs, {
                direction,
                line
            })
        }
        send({
            url: config.url[fixPropName],
            body: JSON.stringify(sendArgs)
        })
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
                    dispatch('A_CELLS_ADD', extend(propStruct, {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }))
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
            getters.selectByType(SELECT) : {}
        let wholePosi = coordinate === false ?
            select.wholePosi :
            coordinate
        let rows = getters.allRows
        let cols = getters.allCols
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let signalSort = coordinate === false ? select.signalSort : {
            startCol: cols[startColIndex].sort,
            startRow: rows[startRowIndex].sort,
            endCol: cols[endColIndex] ? cols[endColIndex].sort : -1,
            endRow: rows[endRowIndex] ? rows[endRowIndex].sort : -1
        }
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            throw new Error('index out of loaded arrange')
        }
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
        getters
    }, coordinate = false) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : {}
        let wholePosi = coordinate === false ?
            select.wholePosi :
            coordinate
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            throw new Error('index out of loaded arrange')
        }
        let allCols = getters.allCols
        let allRows = getters.allRows
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let signalSort = coordinate === false ? select.signalSort : {
            startCol: allCols[startColIndex].sort,
            startRow: allRows[startRowIndex].sort,
            endCol: allCols[startColIndex].sort,
            endRow: allRows[endRowIndex].sort
        }
        let data = {
            coordinate: [signalSort]
        }
        await send({
            url: config.url.merge,
            body: JSON.stringify(data)
        })
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
        dispatch('A_CELLS_ADD', templateCell)
    },
    async [A_CELLS_SPLIT]({
        rootState,
        dispatch,
        getters,
        commit
    }, coordinate = false) {
        let select = coordinate === false ?
            getters.selectByType(SELECT) : {}
        let wholePosi = coordinate === false ?
            select.wholePosi :
            coordinate
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            throw new Error('index out of loaded arrange')
        }
        let allCols = getters.allCols
        let allRows = getters.allRows
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let signalSort = coordinate === false ? select.signalSort : {
            startCol: allCols[startColIndex].sort,
            startRow: allRows[startRowIndex].sort,
            endCol: allCols[startColIndex].sort,
            endRow: allRows[endRowIndex].sort
        }
        let data = {
            coordinate: [signalSort]
        }
        await send({
            url: config.url.split,
            body: JSON.stringify(data)
        })
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
        dispatch('A_CELLS_ADD', insertCells)
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
            getters.selectByType(SELECT) : {}
        let wholePosi = coordinate === false ?
            select.wholePosi :
            coordinate
        if (wholePosi.startRowAlias === 'MAX' || wholePosi.endRowAlias === 'MAX' || wholePosi.startColAlias === 'MAX' || wholePosi.endColAlias === 'MAX') {
            throw new Error('index out of loaded arrange')
        }
        let values = value.split('-')
        let format = values[0]
        let express = values[1]

        // 修正参数
        let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
        let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
        let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
        let data = {
            coordinate: [{
                startCol: startColIndex,
                startRow: startRowIndex,
                endCol: endColIndex === -1 ? -1 : endColIndex,
                endRow: endRowIndex === -1 ? -1 : endRowIndex,
            }],
            format,
            express
        }
        send({
            url: config.url.format,
            body: JSON.stringify(data)
        })
        let rules = parseExpress(value)
        let props = {
            content: {
                type: format,
                express
            }
        }
        // let cols = getters.allCols
        // let rows = getters.allRows
        // endColIndex = endColIndex === -1 ? cols.length - 1 : endColIndex
        // endRowIndex = endRowIndex === -1 ? rows.length - 1 : endRowIndex
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
                            let display = parseText(cells[idx])
                            let updateProps = extend(props, display)
                            commit(mutationTypes.UPDATE_CELL, {
                                idx,
                                prop: updateProps
                            })
                        }
                    } else {
                        let align = parseAddAglin()
                        props.content.alignRow = align
                        dispatch('A_CELLS_ADD', extend(props, {
                            occupy: {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                        }))
                    }
                }
            }
        }
        function parseAddAglin() {
            let align
            if (format === 'text') {
                align = {
                    content: {
                        alignRowFormat: 'left'
                    }
                }
            } else if (format === 'number' || format === 'percent' || format === 'currency' || format === 'routine' || format === 'data') {
                align = {
                    content: {
                        alignRowFormat: 'right'
                    }
                }
            }
            return align
        }
        function parseText(cell) {
            let text = cell.content.texts
            let align = {}
            // 判断对齐方式
            if (format === 'text') {
                align = {
                    content: {
                        alignRowFormat: 'left'
                    }
                }
            } else if ((format === 'number' || format === 'percent' || format === 'currency' || format === 'routine') && (isNum(text) || text === '')) {
                align = {
                    content: {
                        alignRowFormat: 'right'
                    }
                }
            } else if ((format === 'date' || format === 'routine') && (isDate(text) || text === '')) {
                align = {
                    content: {
                        alignRowFormat: 'right'
                    }
                }
            } else {
                align = {
                    content: {
                        alignRowFormat: 'left'
                    }
                }
            }
            if (format === 'date' && isDate(text)) {
                text = formatText(rules, text)
            } else if (format !== 'date' && isNum(text)) {
                text = formatText(rules, parseFloat(text, 10))
            }
            return extend({
                content: {
                    displayTexts: text,
                }
            }, align)
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
        let targetActivePosi = getters.selectByType('SELECT').activePosi
        let targetStartRowIndex = getters.rowIndexByAlias(targetActivePosi.rowAlias)
        let targetStartColIndex = getters.colIndexByAlias(targetActivePosi.colAlias)
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
        dispatch('A_CELLS_ADD', addCells)
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
        let colAlias = select.activePosi.colAlias
        let rowAlias = select.activePosi.rowAlias
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
                let fixProp = parsePropStruct(nowCell, formatObj, cell.text)
                let express = fixProp.content.express
                let fixText = fixProp.content.texts
                propStruct.content = fixProp.content
                if (express !== '@') {
                    rules = parseExpress(express)
                    date = formatObj.date
                    if (date && fixProp.content.type !== 'date') {
                        propStruct.content.displayTexts = fixText
                    } else {
                        propStruct.content.displayTexts = parseText(fixText)
                    }
                } else {
                    propStruct.content.displayTexts = fixText
                }
            }
            dispatch('A_CELLS_UPDATE', {
                propName: 'texts',
                propStruct,
                coordinate: {
                    startColAlias: colAlias,
                    endColAlias: colAlias,
                    startRowAlias: rowAlias,
                    endRowAlias: rowAlias,
                }
            })
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