import * as actionTypes from '../../action-types'
import {
    isDate, formatText,
    isNum, parseExpress,
    parsePropStruct, parseType,
    dataValidate
} from '../../../tools/format'
import cache from '../../../tools/cache'
// import config from '../../../config'
export default {
    [actionTypes.EDIT_SHOW]({
        state,
        rootState,
        getters,
        commit
    }, {
        type,
        value
    }) {
        // 获取当前选中的单元格
        // 算出选中个的位置、宽高信息
        // 设置该模型覆盖其位置
        let activeCell = getters.activeCell()
        let propStruct = {}
        let userView = getters.userView()
        // 编辑单元格内容
        if (type === 'EDIT') {
            let protect = getters.isProtect()
            let lock = activeCell == null ? true : activeCell.content.locked
            if (protect && lock) {
                commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            if (activeCell != null) {
                let content = activeCell.content
                let physicsBox = activeCell.physicsBox
                cache.initText = content.texts
                propStruct = {
                    physical: {
                        left: physicsBox.left - userView.left,
                        top: physicsBox.top - userView.top,
                        width: physicsBox.width,
                        height: physicsBox.height,
                        texts: content.texts,
                        // size: content.size,
                        // family: content.family,
                        color: 'rgb(0,0,0)',
                        weight: content.weight,
                        italic: content.italic,
                        edit: 'texts'
                    },
                    assist: {
                        colAlias: activeCell.occupy.col[0],
                        rowAlias: activeCell.occupy.row[0],
                        endcolAlias: activeCell.occupy.col[0],
                        endrowAlias: activeCell.occupy.row[0],
                        status: true
                    }
                }
            } else {
                cache.initText = null
                let select = getters.selectByType('SELECT')
                let colAlias = select.wholePosi.startColAlias
                let rowAlias = select.wholePosi.startRowAlias
                let endcolAlias = select.wholePosi.endColAlias
                let endrowAlias = select.wholePosi.endRowAlias
                let colIndex = getters.colIndexByAlias(colAlias)
                let rowIndex = getters.rowIndexByAlias(rowAlias)
                let cols = getters.allCols
                let rows = getters.allRows
                let colItem = cols[colIndex]
                let rowItem = rows[rowIndex]
                propStruct = {
                    physical: {
                        left: colItem.left - userView.left,
                        top: rowItem.top - userView.top,
                        width: colItem.width,
                        height: rowItem.height,
                        edit: 'texts'
                    },
                    assist: {
                        colAlias,
                        rowAlias,
                        endcolAlias,
                        endrowAlias
                    }
                }
            }
            // 有传入值时，更新输入框的值
            if (typeof value !== 'undefined') {
                propStruct.physical.texts = value
            }
            if (value === 'Process') {
                propStruct.physical.texts = ''
            }
            // 批注
        } else if (type === 'COMMENT') {
            let select = getters.selectByType('SELECT')
            let colAlias = select.wholePosi.startColAlias
            let rowAlias = select.wholePosi.startRowAlias
            let endcolAlias = select.wholePosi.endColAlias
            let endrowAlias = select.wholePosi.endRowAlias
            if (activeCell != null) {
                let content = activeCell.content
                let customProp = activeCell.customProp
                let physicsBox = activeCell.physicsBox
                cache.initText = customProp.comment
                propStruct = {
                    physical: {
                        left: physicsBox.left + select.physicsBox.width + 5 - userView.left,
                        top: physicsBox.top - userView.top,
                        width: 150,
                        height: 150,
                        texts: customProp.comment,
                        size: 11,
                        family: content.family,
                        color: 'rgb(0,0,0)',
                        weight: content.weight,
                        italic: content.italic,
                        edit: 'comment'
                    },
                    assist: {
                        colAlias,
                        rowAlias,
                        endcolAlias,
                        endrowAlias,
                        status: true
                    }
                }
            } else {
                cache.initText = null
                let colIndex = getters.colIndexByAlias(colAlias)
                let rowIndex = getters.rowIndexByAlias(rowAlias)
                let cols = getters.allCols
                let rows = getters.allRows
                let colItem = cols[colIndex]
                let rowItem = rows[rowIndex]
                propStruct = {
                    physical: {
                        left: colItem.left + select.physicsBox.width + 5 - userView.left,
                        top: rowItem.top - userView.top,
                        width: 150,
                        height: 150,
                        edit: 'comment'
                    },
                    assist: {
                        colAlias,
                        rowAlias,
                        endcolAlias,
                        endrowAlias
                    }
                }
            }
        }
        commit('M_INPUT_UPDATE_PROPS', propStruct)
    },
    async A_INPUT_EDITDONE({
        getters,
        dispatch,
        commit
    }, {
        texts, status
    }) {
        let props = getters.inputProps
        let colAlias = props.assist.colAlias
        let rowAlias = props.assist.rowAlias
        let endcolAlias = colAlias
        let endrowAlias = rowAlias
        if (colAlias == null || rowAlias == null) {
            return
        }
        let colIndex = getters.colIndexByAlias(colAlias)
        let rowIndex = getters.rowIndexByAlias(rowAlias)
        let cell = getters.cellsByVertical({
            startColIndex: colIndex,
            startRowIndex: rowIndex,
            endColIndex: colIndex,
            endRowIndex: rowIndex
        })[0]
        let row = getters.allRows[rowIndex].props.content
        let col = getters.allCols[colIndex].props.content
        if (cell) {
            endcolAlias = cell.occupy.col[cell.occupy.col.length - 1]
            endrowAlias = cell.occupy.row[cell.occupy.row.length - 1]
        }
        let rules
        let date = false
        let propStruct = { content: {}}
        if (status === 'texts') {
            // 判断输入类型
            let formatObj = parseType(texts)
            if (formatObj.autoRecType === 'text') {
                propStruct.content.texts = texts
                propStruct.content.displayTexts = texts
                // 修正单元格对齐方式
                propStruct.content.alignRowFormat = 'left'
            } else {
                let fixProp = parsePropStruct(cell, formatObj, texts, row, col)
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
        }
        if (status === 'comment') {
            propStruct = {
                customProp: {
                    comment: texts
                }
            }
            endcolAlias = props.assist.endcolAlias
            endrowAlias = props.assist.endrowAlias
        }
        let flag = false
        if (cell != null && status === 'texts') {
            let ruleID = cell.ruleIndex
            if (ruleID != null) {
                let validate = getters.validateByIndex(ruleID)
                flag = await dataValidate(validate, texts, rowIndex, colIndex)
            }
        }
        if (flag && texts !== '') {
            commit('M_UPDATE_PROMPT', {
                texts: '输入非法值！已经限定了可以输入的数值！',
                show: true,
                type: 'error'
            })
            return
        }
        await dispatch('A_CELLS_UPDATE', {
            propName: status,
            propStruct,
            coordinate: {
                wholePosi: {
                    startColAlias: colAlias,
                    endColAlias: endcolAlias,
                    startRowAlias: rowAlias,
                    endRowAlias: endrowAlias,
                },
                signalSort: {
                    startCol: getters.colIndexByAlias(colAlias),
                    startRow: getters.rowIndexByAlias(rowAlias),
                    endCol: getters.colIndexByAlias(endcolAlias),
                    endRow: getters.rowIndexByAlias(endrowAlias)
                }
            }
        })
        // 恢复到初始状态
        commit('M_INPUT_RESET')
        // 将单元格显示内容格式化
        function parseText(texts) {
            let text = texts
            if (date && isDate(text)) {
                text = formatText(rules, text)
            } else if (!date && isNum(text)) {
                text = formatText(rules, parseFloat(text, 10))
            }
            return text
        }
    }
}