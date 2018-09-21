import {
    COLS_OPERCOLS,
    ROWS_OPERROWS,
    A_CELLS_MERGE,
    A_CELLS_DESTORY,
    A_CELLS_SPLIT,
    CELLS_FORMAT,
    CELLS_INNERPASTE,
    CELLS_WORDWRAP,
    SELECTS_CHANGE,
    ROWS_ADJUSTHEIGHT
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
            endCol: cols[endColIndex].sort,
            endRow: rows[endRowIndex].sort
        }
        let sendArgs = {
            coordinate: [signalSort]
        }
        let fixPropName = propName
        switch (propName) {
            case 'wordWrap':
                sendArgs = extend(sendArgs, {
                    auto: propStruct.content[propName]
                })
                break
            case 'texts':
                sendArgs = extend({
                    coordinate: signalSort
                }, {
                    content: propStruct.content[propName]
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
        function fixBorder() {
            fixPropName = 'border'
            let direction = propName.split('.')[1]
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
                        commit(mutationTypes.UPDATE_CELL, {
                            idx,
                            prop: propStruct
                        })
                    }
                } else {
                    dispatch('A_CELLS_ADD', extend(template, propStruct, {
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }))
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
                        let insertCell = extend(cell)
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
                endCol: endColIndex === 'MAX' ? -1 : endColIndex,
                endRow: endRowIndex === 'MAX' ? -1 : endRowIndex,
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
                        dispatch('A_CELLS_ADD', extend(template, props, {
                            occupy: {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                        }))
                    }
                }
            }
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
                    displayTexts: text,
                }
            }
        }
    },
    A_CELLS_INNERPASTE({
        getters
    }) {

        // pause
        console.log('A_CELLS_INNERPASTE')
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
        let cols = getters.allCols
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
                let cellIndex = getters.IdxByCol(aliasCol, aliasRow)
                if (cellIndex !== -1 && !temp[cellIndex]) {
                    temp[cellIndex] = true
                    cacheInfo.push({
                        colRelative,
                        rowRelative,
                        cellIndex
                    })
                    if (cache.clipState === 'cut') {
                        commit(mutationTypes.M_UPDATE_POINTS, {
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
                dispatch('A_CELLS_ADD', [insertCell])
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
                let clip = getters.selectByType(CLIP)
                cache.clipState = ''
                commit(mutationTypes.DELETE_SELECT, {
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
        let oprCol = getters.getColByAlias(colAlias)
        let oprRow = getters.getRowByAlias(rowAlias)
        await send({
            url: config.url['outerpaste'],
            body: JSON.stringify({
                oprCol: oprCol.sort,
                oprRow: oprRow.sort,
                content: texts
            })
        }).then(function(data) {
            if (!data.isLegal) {
                return
            }
        })

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

        // 清除复制选中区
        // 这部分还没做，需要些函数来确定
        let parseCells = parseData.data
        parseCells.forEach(cell => {
            let colAlias = cols[cell.colRelative + startColIndex].alias
            let rowAlias = rows[cell.rowRelative + startRowIndex].alias
            let idx = getters.IdxByRow(colAlias, rowAlias)
            if (idx === -1) {
                dispatch('A_CELLS_ADD', {
                    occupy: {
                        col: [colAlias],
                        row: [rowAlias]
                    },
                    content: {
                        texts: cell.text,
                        displayTexts: cell.text
                    }
                })
            } else {
                dispatch('A_CELLS_UPDATE', {
                    propName: 'texts',
                    propStruct: {
                        content: {
                            texts: cell.text,
                            displayTexts: cell.text
                        }
                    },
                    coordinate: {
                        startRowAlias: rowAlias,
                        endRowAlias: rowAlias,
                        startColAlias: colAlias,
                        endColAlias: colAlias
                    }
                })
            }

        })
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
            dispatch('A_CELLS_UPDATE', {
                propName: 'wordWrap',
                propStruct: props
            })
            if (oprRows) {
                oprRows.forEach(info => {
                    dispatch(ROWS_ADJUSTHEIGHT, {
                        index: info.index,
                        height: info.height
                    })
                })
            }
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
            let cellIdx = getters.IdxByRow(occupyCols[0], occupyRows[0])
            commit(mutationTypes.M_UPDATE_POINTS, {
                occupyCols,
                occupyRows,
                cellIdx
            })
        })
    }
}