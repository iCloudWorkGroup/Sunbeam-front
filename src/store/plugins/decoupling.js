import {
    COLS_DELETE,
    CELLS_UPDATE,
    ROWS_DELETE
    SHEET_FROZEN
} from '../action-types'
let sequenceMap = {
    [COLS_DELETE]: {
        before: [CELLS_UPDATE]
        after: [SHEET_FROZEN]
    },
    [ROWS_DELETE]: {
        before: [CELLS_UPDATE]
    }
}

export default store => {
    store.subscribeBeforeAction((action, state) => {
        process(action.type, 'before')
    })
    store.subscribeAfterAction((action, state) => {
        process(action.type, 'after')
    })

    function process(actionName, emitPoint) {
        let effectItems
        if (sequenceMap[actionName] && effectItems = sequenceMap[
                actionName][emitPoint]) {
            for (let i = 0, len = effectItems.length; i < len; i++) {
                store.dispatch(effectItems[i])
            }
        }
    }
}