import extend from '../../../util/extend'
import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import template from './template'
import {
    SELECT
} from '../../../tools/constant'


let viewTypes = {
    mainRule: 'mainView',
    leftRule: 'leftView',
    topRule: 'topView',
    cornerRule: 'cornerView'
}

export default {
    /**
     * 还原sheet
     */
    [actionTypes.SHEET_INSERTSHEET]({
        commit,
        state
    }, sheet) {
        let list = state.list
        let flag = true
        for (let i = 0, len1 = state.length; i < len1; i++) {
            if (list[i].alias === sheet.alias) {
                flag = false
                break
            }
        }
        if (flag) {
            commit(mutationTypes.INSERT_SHEET, extend({}, template, sheet))
        }
    },
    [actionTypes.SHEET_FROZEN]({
        commit,
        state,
        getters,
        rootState,
        dispatch
    }) {
        let currentSheet = rootState.currentSheet
        let selects = rootState.selects[currentSheet].list
        let stateList = state.list
        let frozenState

        for (let i = 0, len = stateList.length; i < len; i++) {
            if (stateList[i].alias === currentSheet) {
                frozenState = stateList[i]
                break
            }
        }

        if (frozenState.isFrozen) {
            return
        }

        let select

        selects.forEach(function(item) {
            if (item.type === SELECT) {
                select = item
            }
        })

        let frozenRowAlias = select.wholePosi.startRowAlias
        let frozenColAlias = select.wholePosi.startColAlias
        let frozenRowIndex = getters.getRowIndexByAlias(frozenRowAlias)
        let frozenColIndex = getters.getColIndexByAlias(frozenColAlias)

        let userView = rootState.userView
        let userViewTopIndex = getters.getRowIndexByPosi(userView.top)
        let userViewBottomIndex = getters.getRowIndexByPosi(userView.bottom)
        let userViewRightIndex = getters.getColIndexByPosi(userView.right)
        let userViewLeftIndex = getters.getColIndexByPosi(userView.left)

        // 非可视范围，不能进行冻结

        if (frozenRowIndex - userViewTopIndex < 0 ||
            userViewBottomIndex - frozenRowIndex < 0 ||
            frozenColIndex - userViewLeftIndex < 0 ||
            userViewRightIndex - frozenColIndex < 0) {
            return
        }
        // 左上角位置不能进行冻结
        if (frozenRowIndex === userViewTopIndex &&
            frozenColIndex === userViewLeftIndex) {
            return
        }

        if (frozenColIndex === userViewLeftIndex) {
            dispatch(actionTypes.SHEET_FIRSTROWFROZEN, frozenRowIndex)
            return
        }
        if (frozenRowIndex === userViewTopIndex) {
            dispatch(actionTypes.SHEET_FIRSTCOLFROZEN, frozenColIndex)
            return
        }


        let rowList = getters.rowList
        let colList = getters.colList
        let userViewCol = colList[userViewLeftIndex]
        let userViewRow = rowList[userViewTopIndex]
        let frozenCol = colList[frozenColIndex]
        let frozenRow = rowList[frozenRowIndex]

        let rules = []

        rules.push({
            type: 'cornerRule',
            startRowIndex: userViewTopIndex,
            endRowIndex: frozenRowIndex - 1,
            startColIndex: userViewLeftIndex,
            endColIndex: frozenColIndex - 1,
            offsetTop: userViewRow.top,
            offsetLeft: userViewCol.left,
            width: frozenCol.left - userViewCol.left - 1, // 减1为边框的宽度
            height: frozenRow.top - userViewRow.top - 1
        }, {
            type: 'topRule',
            startRowIndex: userViewTopIndex,
            endRowIndex: frozenRowIndex - 1,
            startColIndex: frozenColIndex,
            userViewLeft: userViewCol.left,
            offsetTop: userViewRow.top,
            offsetLeft: frozenCol.left,
            height: frozenRow.top - userViewRow.top - 1
        }, {
            type: 'leftRule',
            startRowIndex: frozenRowIndex,
            startColIndex: userViewLeftIndex,
            endColIndex: frozenColIndex - 1,
            userViewTop: userViewRow.top,
            offsetLeft: userViewCol.left,
            offsetTop: frozenRow.top,
            width: frozenCol.left - userViewCol.left - 1
        }, {
            type: 'mainRule',
            startRowIndex: frozenRowIndex,
            startColIndex: frozenColIndex,
            userViewTop: userViewRow.top,
            userViewLeft: userViewCol.left,
            offsetLeft: frozenCol.left,
            offsetTop: frozenRow.top
        })

        commit(mutationTypes.UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: true,
            colFrozen: true,
            rules,
            currentSheet
        })
    },
    [actionTypes.SHEET_FIRSTCOLFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, indexArgs) {
        let index = indexArgs
        let currentSheet = rootState.currentSheet
        let stateList = state.list
        let frozenState

        for (let i = 0, len = stateList.length; i < len; i++) {
            if (stateList[i].alias === currentSheet) {
                frozenState = stateList[i].frozenState
                break
            }
        }
        if (frozenState.isFrozen) {
            return
        }

        let userView = rootState.userView
        let userViewLeftIndex = getters.getColIndexByPosi(userView.left)
        if (index == null) {
            index = userViewLeftIndex + 1
        }
        let frozenColIndex = index

        let colList = getters.colList
        let userViewCol = colList[userViewLeftIndex]
        let frozenCol = colList[frozenColIndex]

        let rules = []

        rules.push({
            type: 'leftRule',
            startRowIndex: 0,
            startColIndex: userViewLeftIndex,
            endColIndex: frozenColIndex - 1,
            offsetLeft: userViewCol.left,
            offsetTop: 0,
            width: frozenCol.left - userViewCol.left - 1
        }, {
            type: 'mainRule',
            startRowIndex: 0,
            startColIndex: frozenColIndex,
            offsetLeft: frozenCol.left,
            userViewLeft: userViewCol.left,
            offsetTop: 0
        })
        commit(mutationTypes.UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: false,
            colFrozen: true,
            rules,
            currentSheet
        })
    },
    [actionTypes.SHEET_FIRSTROWFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, indexArgs) {
        let index = indexArgs
        let currentSheet = rootState.currentSheet
        let stateList = state.list
        let frozenState

        for (let i = 0, len = stateList.length; i < len; i++) {
            if (stateList[i].alias === currentSheet) {
                frozenState = stateList[i]
                break
            }
        }
        if (frozenState.isFrozen) {
            return
        }

        let userView = rootState.userView
        let userViewTopIndex = getters.getRowIndexByPosi(userView.top)
        if (index == null) {
            index = userViewTopIndex + 1
        }
        let frozenRowIndex = index

        let rowList = getters.rowList
        let userViewRow = rowList[userViewTopIndex]
        let frozenRow = rowList[frozenRowIndex]

        let rules = []

        rules.push({
            type: 'topRule',
            startColIndex: 0,
            startRowIndex: userViewTopIndex,
            endRowIndex: frozenRowIndex - 1,
            offsetTop: userViewRow.top,
            offsetLeft: 0,
            width: frozenRow.top - userViewRow.top - 1
        }, {
            type: 'mainRule',
            startRowIndex: frozenRowIndex,
            startColIndex: 0,
            offsetTop: frozenRow.top,
            userViewTop: userViewRow.top,
            offsetLeft: 0
        })
        commit(mutationTypes.UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: true,
            colFrozen: false,
            rules,
            currentSheet
        })
    },
    [actionTypes.SHEET_UNFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, sheet) {
        commit(mutationTypes.UPDATE_FROZENSTATE, {
            isFrozen: false,
            rowFrozen: false,
            colFrozen: false,
            rules: [],
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.OCCUPY_UPDATE]({
        commit,
        getters,
        rootState
    }, {
        type = 'mainRule',
        col,
        row
    }) {
        commit(mutationTypes.UPDATE_OCCUPY, {
            currentSheet: rootState.currentSheet,
            type: viewTypes[type],
            col,
            row
        })
    },
    [actionTypes.OCCUPY_DELETECOL]({
        state,
        commit,
        getters,
        rootState
    }, alias) {
        let currentSheet = rootState.currentSheet
        let stateList = state.list
        let editViewOccupy

        for (let i = 0, len = stateList.length; i < len; i++) {
            if (stateList[i].alias === currentSheet) {
                editViewOccupy = stateList[i].editViewOccupy
                break
            }
        }

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let index
                let occupyCol = editViewOccupy[key].col.slice(0)

                if ((index = occupyCol.indexOf(alias)) !== -1) {
                    occupyCol.splice(index, 1)
                    commit(mutationTypes.UPDATE_OCCUPY, {
                        currentSheet: rootState.currentSheet,
                        type: key,
                        col: occupyCol
                    })
                }
            }
        }
    },
    [actionTypes.OCCUPY_DELETEROW]({
        commit,
        getters,
        rootState
    }, alias) {

        //  为了不抱错误，这里的逻辑是走不通的
        let state = {}

        let currentSheet = rootState.currentSheet
        let stateList = state.list
        let editViewOccupy

        for (let i = 0, len = stateList.length; i < len; i++) {
            if (stateList[i].alias === currentSheet) {
                editViewOccupy = stateList[i].editViewOccupy
                break
            }
        }

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let index
                let occupyRow = editViewOccupy[key].row.slice(0)

                if ((index = occupyRow.indexOf(alias)) !== -1) {
                    occupyRow.splice(index, 1)

                    commit(mutationTypes.UPDATE_OCCUPY, {
                        currentSheet: rootState.currentSheet,
                        type: key,
                        row: occupyRow
                    })
                }
            }
        }
    }
}