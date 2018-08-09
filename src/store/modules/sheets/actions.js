import extend from '../../../util/extend'
import * as actionTypes from '../../action-types'
import {
    INSERT_SHEET,
    UPDATE_FROZENSTATE,
    UPDATE_OCCUPY
} from '../../mutation-types'
import template from './template'
import send from '../../../util/send'
import config from '../../../config'

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
    [actionTypes.SHEET_INSERT]({
        commit,
        getters,
        state,
        rootState
    }, sheet) {
        let fixedSheet = {
            alias: sheet.alias,
            name: sheet.name,
            frozen: {}
        }
        if (sheet.frozen && sheet.frozen.colAlias) {
            let cols = rootState.cols.list
            let first = cols[0].alias
            let last = cols[cols.length - 1].alias
            let neighbor = getters.neighborColByAlias(sheet.frozen.colAlias,
                'NEXT')
            if (neighbor == null) {
                throw new Error('frozen position error from col')
            }
            fixedSheet.frozen.col = [{
                start: first,
                over: sheet.frozen.colAlias
            }, {
                start: neighbor.alias,
                over: last
            }]
        }
        if (sheet.frozen && sheet.frozen.rowAlias) {
            let rows = rootState.rows.list
            let first = rows[0].alias
            let last = rows[rows.length - 1].alias
            let neighbor = getters.neighborRowByAlias(sheet.frozen.rowAlias,
                'NEXT')
            if (neighbor == null) {
                throw new Error('frozen position error from row')
            }
            fixedSheet.frozen.row = [{
                start: first,
                over: sheet.frozen.rowAlias
            }, {
                start: neighbor.alias,
                over: last
            }]
        }
        commit(INSERT_SHEET, extend(template, fixedSheet))

    },
    [actionTypes.SHEET_FROZEN]({
        state,
        getters,
        rootState,
        dispatch
    }, type) {
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
        let select = getters.activeSelect
        let frozenRowAlias = select.wholePosi.startRowAlias
        let frozenColAlias = select.wholePosi.startColAlias
        let frozenRowIndex = getters.getRowIndexByAlias(frozenRowAlias)
        let frozenColIndex = getters.getColIndexByAlias(frozenColAlias)

        let userView = rootState.userView
        let userViewTopIndex = getters.getRowIndexByPosi(userView.top)
        let userViewLeftIndex = getters.getColIndexByPosi(userView.left)
        let userViewBottomIndex = getters.getRowIndexByPosi(userView.bottom)
        let userViewRightIndex = getters.getColIndexByPosi(userView.right)


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
        let rows = getters.rowList
        let cols = getters.colList
        let userViewLeft = cols[userViewLeftIndex]
        let userViewTop = rows[userViewTopIndex]
        let frozenCol = cols[frozenColIndex]
        let frozenRow = rows[frozenRowIndex]
        send({
            url: config.url['frozen'],
            data: JSON.stringify({
                viewRow: userViewTop.alias,
                viewCol: userViewLeft.alias,
                oprCol: frozenCol.alias,
                oprRow: frozenRow.alias
            })
        })
        if (type === 'firstRowFrozen') {
            dispatch(actionTypes.SHEET_ROWFROZEN, {
                userViewSort: userViewTop.sort,
                frozenRowSort: userViewTop.sort + 1
            })
        } else if (type === 'firstColFrozen') {
            dispatch(actionTypes.SHEET_COLFROZEN, {
                userViewSort: userViewLeft.sort,
                frozenColSort: userViewLeft.sort + 1
            })
        } else if (frozenColIndex === userViewLeftIndex) {
            dispatch(actionTypes.SHEET_ROWFROZEN, {
                userViewSort: userViewTop.sort,
                frozenRowSort: frozenRow.sort
            })
        } else if (frozenRowIndex === userViewTopIndex) {
            dispatch(actionTypes.SHEET_COLFROZEN, {
                userViewSort: userViewLeft.sort,
                frozenColSort: frozenCol.sort
            })
        } else {
            dispatch(actionTypes.SHEET_POINTFROZEN, {
                frozenColSort: frozenCol.sort,
                frozenRowSort: frozenRow.sort,
                userViewColSort: userViewLeft.sort,
                userViewRowSort: userViewTop.sort
            })
        }
    },
    [actionTypes.SHEET_RESTOREFROZEN]({
        dispatch,
        getters
    }, frozen) {
        if (frozen) {
            let userViewLeft = getters.getColByAlias(frozen.viewColAlias)
            let userViewTop = getters.getRowByAlias(frozen.viewRowAlias)
            let frozenCol = getters.getColByAlias(frozen.colAlias)
            let frozenRow = getters.getRowByAlias(frozen.rowAlias)

            if (frozenCol.sort === userViewLeft.sort) {
                dispatch(actionTypes.SHEET_ROWFROZEN, {
                    userViewSort: userViewTop.sort,
                    frozenRowSort: frozenRow.sort
                })
            } else if (frozenRow.sort === userViewTop.sort) {
                dispatch(actionTypes.SHEET_COLFROZEN, {
                    userViewSort: userViewLeft.sort,
                    frozenColSort: frozenCol.sort
                })
            } else {
                dispatch(actionTypes.SHEET_POINTFROZEN, {
                    frozenColSort: frozenCol.sort,
                    frozenRowSort: frozenRow.sort,
                    userViewColSort: userViewLeft.sort,
                    userViewRowSort: userViewTop.sort
                })
            }
        }
    },
    [actionTypes.SHEET_COLFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, {
        userViewSort,
        frozenColSort
    }) {
        let colList = getters.colList
        let frozenColIndex = getters.getColIndexBySort(frozenColSort)
        let userViewLeftIndex = getters.getColIndexBySort(userViewSort)
        let userViewCol = colList[userViewLeftIndex]
        let frozenCol = colList[frozenColIndex]
        let currentSheet = rootState.currentSheet
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
        commit(UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: false,
            colFrozen: true,
            frozenColSort,
            frozenRowSort: 0,
            userViewColSort: userViewSort,
            userViewRowSort: 0,
            rules,
            currentSheet
        })
    },
    [actionTypes.SHEET_ROWFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, {
        userViewSort,
        frozenRowSort
    }) {
        let rowList = getters.rowList
        let frozenRowIndex = getters.getRowIndexBySort(frozenRowSort)
        let userViewTopIndex = getters.getRowIndexBySort(userViewSort)
        let userViewRow = rowList[userViewTopIndex]
        let frozenRow = rowList[frozenRowIndex]
        let currentSheet = rootState.currentSheet
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
        commit(UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: true,
            colFrozen: false,
            frozenColSort: 0,
            frozenRowSort,
            userViewColSort: userViewSort,
            userViewRowSort: 0,
            rules,
            currentSheet
        })
    },
    [actionTypes.SHEET_POINTFROZEN]({
        commit,
        state,
        getters,
        rootState
    }, {
        userViewRowSort,
        userViewColSort,
        frozenColSort,
        frozenRowSort
    }) {
        let rows = getters.rowList
        let cols = getters.colList

        let userViewColIndex = getters.getColIndexBySort(userViewColSort)
        let userViewRowIndex = getters.getRowIndexBySort(userViewRowSort)
        let frozenColIndex = getters.getColIndexBySort(frozenColSort)
        let frozenRowIndex = getters.getRowIndexBySort(frozenRowSort)

        let userViewCol = cols[userViewColIndex]
        let userViewRow = rows[userViewRowIndex]
        let frozenCol = cols[frozenColIndex]
        let frozenRow = rows[frozenRowIndex]

        let rules = []
        rules.push({
            type: 'cornerRule',
            startRowIndex: userViewRowIndex,
            endRowIndex: frozenRowIndex - 1,
            startColIndex: userViewColIndex,
            endColIndex: frozenColIndex - 1,
            offsetTop: userViewRow.top,
            offsetLeft: userViewCol.left,
            width: frozenCol.left - userViewCol.left - 1, // 减1为边框的宽度
            height: frozenRow.top - userViewRow.top - 1
        }, {
            type: 'topRule',
            startRowIndex: userViewRowIndex,
            endRowIndex: frozenRowIndex - 1,
            startColIndex: frozenColIndex,
            userViewLeft: userViewCol.left,
            offsetTop: userViewRow.top,
            offsetLeft: frozenCol.left,
            height: frozenRow.top - userViewRow.top - 1
        }, {
            type: 'leftRule',
            startRowIndex: frozenRowIndex,
            startColIndex: userViewColIndex,
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
        commit(UPDATE_FROZENSTATE, {
            isFrozen: true,
            rowFrozen: true,
            colFrozen: true,
            frozenColSort,
            frozenRowSort,
            userViewColSort,
            userViewRowSort,
            rules,
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.SHEET_UNFROZEN]({
        dispatch
    }) {
        send({
            url: config.url['unfrozen']
        })
        dispatch(actionTypes.SHEET_EXECUNFROZEN)
    },
    [actionTypes.SHEET_EXECUNFROZEN]({
        commit,
        rootState
    }) {
        commit(UPDATE_FROZENSTATE, {
            isFrozen: false,
            rowFrozen: false,
            colFrozen: false,
            rules: [],
            currentSheet: rootState.currentSheet
        })
    },
    [actionTypes.OCCUPY_UPDATE]({
        commit,
        rootState
    }, {
        type = 'mainRule',
        col,
        row
    }) {
        commit(UPDATE_OCCUPY, {
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
                    commit(UPDATE_OCCUPY, {
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
        rootState,
        state
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
                let occupyRow = editViewOccupy[key].row.slice(0)

                if ((index = occupyRow.indexOf(alias)) !== -1) {
                    occupyRow.splice(index, 1)

                    commit(UPDATE_OCCUPY, {
                        currentSheet: rootState.currentSheet,
                        type: key,
                        row: occupyRow
                    })
                }
            }
        }
    }
}