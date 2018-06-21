import extend from '../../../util/extend'
import * as mutationTypes from '../../mutation-types'
import * as actionTypes from '../../action-types'

export default {
    [actionTypes.EDIT_SHOW]({
        state,
        rootState,
        getters,
        commit
    }) {
        let wholePosi = getters.activeSelect.wholePosi
        let colAlias = wholePosi.startColAlias
        let rowAlias = wholePosi.startRowAlias
        let colIndex
        let rowIndex

        colIndex = getters.getColIndexByAlias(colAlias)
        rowIndex = getters.getRowIndexByAlias(rowAlias)

        let cellList = getters.getCellsByVertical({
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
            for (let i = 0, len = rule.length; i < len; i++) {
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
            currentSheet: rootState.currentSheet,
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
        let startColIndex = getters.getColIndexByAlias(inputState.colAlias)
        let startRowIndex = getters.getRowIndexByAlias(inputState.rowAlias)

        dispatch(actionTypes.CELLS_UPDATE, {
            startColIndex,
            startRowIndex,
            propNames: 'content.texts',
            value: texts
        })
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
    }
}