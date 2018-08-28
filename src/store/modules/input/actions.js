import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import * as actionTypes from '../../action-types'
import send from '../../../util/send'
import config from '../../../config'
import cellTemplate from '../cells/template'
import {
    parseExpress,
    formatText,
    isNum,
    isDate
} from '../../../tools/format'

export default {
    [actionTypes.EDIT_SHOW]({
        state,
        rootState,
        getters,
        commit
    }) {
        // 获取当前选中的单元格
        // 算出选中个的位置、宽高信息
        // 设置该模型覆盖其位置
        let wholePosi = getters.activeSelect.wholePosi
        let colAlias = wholePosi.startColAlias
        let rowAlias = wholePosi.startRowAlias

        let colIndex = getters.colIndexByAlias(colAlias)
        let rowIndex = getters.rowIndexByAlias(rowAlias)

        let cellList = getters.cellsByVertical({
            startColIndex: colIndex,
            startRowIndex: rowIndex
        })
        let cell = cellList[0]
        let colList = getters.colList
        let rowList = getters.rowList
        let props

        props = {
            editState: true,
            transverseScroll: true,
            verticalScroll: true
        }
        if (cell) {
            props = extend(props, cell.content, cell.physicsBox)
            props.colAlias = cell.occupy.col[0]
            props.rowAlias = cell.occupy.row[0]
        } else {
            let row = rowList[rowIndex]
            let col = colList[colIndex]

            props = extend(props, {
                colAlias,
                rowAlias,
                left: col.left,
                width: col.width,
                top: row.top,
                height: row.height
            })
        }

        let frozenState = getters.frozenState
        if (frozenState.isFrozen) {
            let rules = frozenState.rules
            let rule
            for (let i = 0, len = rules.length; i < len; i++) {
                rule = rules[i]
                if (rule.type === 'mainRule') {
                    break
                }
            }
            let frozenRowIndex = rule.startRowIndex
            let frozenColIndex = rule.startColIndex
            if (colIndex < frozenColIndex) {
                props.transverseScroll = false
            }
            if (rowIndex < frozenRowIndex) {
                props.verticalScroll = false
            }
        }
        commit(mutationTypes.UPDATE_EDIT, {
            inputInfo: props
        })
    },
    [actionTypes.EDIT_HIDE]({
        state,
        rootState,
        getters,
        commit,
        dispatch
    }, texts) {
        let inputState = getters.getInputState
        let startColIndex = getters.colIndexByAlias(inputState.colAlias)
        let startRowIndex = getters.rowIndexByAlias(inputState.rowAlias)
        let cols = getters.colList
        let rows = getters.rowList

        commit(mutationTypes.UPDATE_EDIT, {
            currentSheet: rootState.currentSheet,
            inputInfo: {
                editState: false,
                width: 0,
                height: 0,
                left: -9999,
                top: -9999,
                texts: ''
            }
        })
        let cell = getters.cellsByVertical({
            startColIndex,
            startRowIndex
        })[0]

        if (cell && cell.content.texts === texts) {
            return
        }
        send({
            url: config.url['texts'],
            data: JSON.stringify({
                coordinate: {
                    startCol: cols[startColIndex].sort,
                    startRow: rows[startRowIndex].sort,
                    endCol: cols[startColIndex].sort,
                    endRow: rows[startRowIndex].sort
                },
                content: texts
            }),
        })
        let express
        let type
        if (cell) {
            type = cell.content.type
            express = cell.content.express
        } else {
            type = cellTemplate.content.type
            express = cellTemplate.content.express
        }
        let rules = parseExpress(express)
        let displayTexts
        if (type === 'date' && isDate(texts)) {
            displayTexts = formatText(rules, texts)
        } else if (type !== 'date' && isNum(texts)) {
            displayTexts = formatText(rules, parseFloat(texts, 10))
        } else {
            displayTexts = texts
        }
        dispatch(actionTypes.CELLS_UPDATE_PROP, {
            startColIndex,
            startRowIndex,
            endColIndex: startColIndex,
            endRowIndex: startRowIndex,
            props: {
                content: {
                    texts,
                    displayTexts
                }
            }
        })
        if (!cell) {
            cell = getters.cellsByVertical({
                startColIndex,
                startRowIndex
            })[0]
        }
        if (texts.indexOf('\n') !== -1 && !cell.content.wordWrap) {
            dispatch(actionTypes.CELLS_WORDWRAP, {
                startColIndex,
                startRowIndex
            })
        }
    }
}