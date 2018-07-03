import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'

export default {
    [actionTypes.HISTORY_REDO]({
        state,
        commit,
        dispatch
    }) {
        let index = state.currentIndex
        let list = state.list
        if (list.length === index + 1) {
            return
        }
        let actions = list[index + 1].actions
        actions.forEach(action => {
            dispatch(action.type, action.payload)
        })
        commit(mutationTypes.MOVE_HISTORYINDEX, ++index)
    },
    [actionTypes.HISTORY_UNDO]({
        state,
        commit,
        dispatch,
        rootState
    }) {
        let index = state.currentIndex
        if (index === -1) {
            return
        }
        let list = state.list
        let actions = list[index].actions
        actions.forEach(function(action) {
            let currentStyle = action.type
            let mutations = action.mutations
            if (currentStyle === actionTypes.CELLS_UPDATE_PROP) {
                propUpdateUndo(mutations, commit)
            }
            let coverActions = {
                [actionTypes.CELLS_MERGE]: true,
                [actionTypes.CELLS_SPLIT]: true,
                [actionTypes.CELLS_INNERPASTE]: true,
                [actionTypes.CELLS_OUTERPASTE]: true
            }
            if (coverActions[currentStyle]) {
                coverCellUndo(mutations, commit)
            }
            if (currentStyle === actionTypes.ROWS_OPERROWS ||
                action.type === actionTypes.COLS_OPERCOLS) {
                let mutations = action.mutations
                colRowOprUndo(mutations, commit)
            }
            if (currentStyle === actionTypes.ROWS_EXECADJUSTHEIGHT ||
                action.type === actionTypes.COLS_EXECADJUSTWIDTH) {
                colRowAdjustUndo(action, dispatch)
            }

            if (currentStyle === actionTypes.ROWS_EXECHIDE ||
                currentStyle === actionTypes.ROWS_EXECCANCELHIDE ||
                currentStyle === actionTypes.COLS_EXECHIDE ||
                currentStyle === actionTypes.COLS_EXECCANCELHIDE) {
                colRowHideUndo(currentStyle, action, dispatch)
            }
            // 插入行回退
            if (currentStyle === actionTypes.COLS_EXECINSERTCOL) {
                dispatch(actionTypes.COLS_EXECDELETECOL, action.payload.sort)
            }
            // 插入列回退
            if (currentStyle === actionTypes.ROWS_EXECINSERTROW) {
                dispatch(actionTypes.ROWS_EXECDELETEROW, action.payload.sort)
            }
            if (currentStyle === actionTypes.COLS_EXECDELETECOL) {
                deleteColUndo(action, dispatch, commit)
            }
            if (currentStyle === actionTypes.ROWS_EXECDELETEROW) {
                deleteRowUndo(action, dispatch, commit)
            }
            // 冻结回退
            if (currentStyle === actionTypes.SHEET_POINTFROZEN ||
                currentStyle === actionTypes.SHEET_COLFROZEN ||
                currentStyle === actionTypes.SHEET_ROWFROZEN) {
                dispatch(actionTypes.SHEET_EXECUNFROZEN)
            }
            // 取消冻结回退
            if (currentStyle === actionTypes.SHEET_EXECUNFROZEN) {
                unFrozenUndo(action, dispatch)
            }
        })
        commit(mutationTypes.MOVE_HISTORYINDEX, --index)
    },
    [actionTypes.HISTORY_ADD]({
        state,
        commit
    }, record) {
        commit(mutationTypes.INSERT_HISTORY, record)
    }
}
// 设置属性回退操作
function propUpdateUndo(mutations, commit) {
    mutations.forEach(mutationInfo => {
        if (mutationInfo.type === mutationTypes.UPDATE_CELL ||
            mutationInfo.type === mutationTypes.INSERT_CELL) {
            commit(mutationTypes.UPDATE_CELL, mutationInfo.updateCells)
        }
        if (mutationInfo.type === mutationTypes.UPDATE_POINTINFO) {
            commit(mutationTypes.UPDATE_POINTINFO, mutationInfo.payload)
        }
    })
}
// 单元格覆盖回退操作
function coverCellUndo(mutations, commit) {
    mutations.forEach(mutationInfo => {
        if (mutationInfo.type === mutationTypes.UPDATE_POINTINFO) {
            commit(mutationTypes.UPDATE_POINTINFO, mutationInfo.payload)
        }
    })
}
// 整列整行属性回退操作
function colRowOprUndo(mutations, commit) {
    mutations.forEach(mutationInfo => {
        if (mutationInfo.type === mutationTypes.UPDATE_CELL ||
            mutationInfo.type === mutationTypes.INSERT_CELL) {
            commit(mutationTypes.UPDATE_CELL, mutationInfo.updateCells)
        } else if (mutationInfo.type === mutationTypes.UPDATE_ROW ||
            mutationInfo.type === mutationTypes.UPDATE_COL) {
            commit(mutationInfo.type, mutationInfo.updateRows || mutationInfo.updateCols)
        }
    })
}
// 行高列宽调整
function colRowAdjustUndo(action, dispatch) {
    dispatch(action.type, {
        sort: action.payload.sort,
        value: action.originalValue
    })
}
// 行列隐藏回退
function colRowHideUndo(currentStyle, action, dispatch) {
    let reverseActionList = {
        [actionTypes.ROWS_EXECHIDE]: actionTypes.ROWS_EXECCANCELHIDE,
        [actionTypes.ROWS_EXECCANCELHIDE]: actionTypes.ROWS_EXECHIDE,
        [actionTypes.COLS_EXECHIDE]: actionTypes.COLS_EXECCANCELHIDE,
        [actionTypes.COLS_EXECCANCELHIDE]: actionTypes.COLS_EXECHIDE
    }
    let reverseAction = reverseActionList[currentStyle]
    dispatch(reverseAction, action.payload)
}
// 删除列回退
function deleteColUndo(action, dispatch, commit) {
    let originalValue = action.originalValue
    originalValue.active = false
    dispatch(actionTypes.COLS_EXECINSERTCOL, {
        sort: action.payload,
        colModel: originalValue
    })
    let mutations = action.mutations
    mutations.forEach(mutationInfo => {
        if (mutationInfo.type === mutationTypes.UPDATE_SELECT) {
            mutationInfo.updateCells.forEach(({
                cell,
                props
            }) => {
                if (props.occupy && cell.occupy.col.length !== props.occupy.col.length) {
                    commit(mutationTypes.UPDATE_CELL, {
                        cell,
                        props: {
                            occupy: {
                                col: props.occupy.col
                            },
                            physicsBox: {
                                width: cell.physicsBox.width + originalValue.width + 1
                            }
                        }
                    })
                }
            })
        }
        if (mutationInfo.type === mutationTypes.UPDATE_POINTINFO) {
            commit(mutationTypes.UPDATE_POINTINFO, mutationInfo.payload)
        }
    })
}
// 删除行回退
function deleteRowUndo(action, dispatch, commit) {
    let originalValue = action.originalValue
    originalValue.active = false
    dispatch(actionTypes.ROWS_EXECINSERTROW, {
        sort: action.payload,
        rowModel: originalValue
    })
    let mutations = action.mutations
    mutations.forEach(mutationInfo => {
        if (mutationInfo.type === mutationTypes.UPDATE_SELECT) {
            mutationInfo.updateCells.forEach(({
                cell,
                props
            }) => {
                if (props.occupy && cell.occupy.row.length !== props.occupy.row.length) {
                    commit(mutationTypes.UPDATE_CELL, {
                        cell,
                        props: {
                            occupy: {
                                row: props.occupy.row
                            },
                            physicsBox: {
                                height: cell.physicsBox.height + originalValue.height + 1
                            }
                        }
                    })
                }
            })
        }
        if (mutationInfo.type === mutationTypes.UPDATE_POINTINFO) {
            commit(mutationTypes.UPDATE_POINTINFO, mutationInfo.payload)
        }
    })
}
// 取消冻结回退
function unFrozenUndo(action, dispatch) {
    let {
        userViewRowSort,
        frozenRowSort,
        userViewColSort,
        frozenColSort
    } = action.frozenRecord

    if (frozenColSort === userViewColSort) {
        dispatch(actionTypes.SHEET_ROWFROZEN, {
            userViewSort: userViewRowSort,
            frozenRowSort: frozenRowSort
        })
    } else if (frozenRowSort === userViewRowSort) {
        dispatch(actionTypes.SHEET_COLFROZEN, {
            userViewSort: userViewColSort,
            frozenColSort: frozenColSort
        })
    } else {
        dispatch(actionTypes.SHEET_POINTFROZEN, {
            frozenColSort,
            frozenRowSort,
            userViewColSort,
            userViewRowSort
        })
    }
}