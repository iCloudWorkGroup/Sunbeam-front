import cache from '../../tools/cache'
import { CLIP } from '../../tools/constant'
import * as mutationTypes from '../../store/mutation-types'
export default function(store) {
    store.subscribeBeforeAction((action, state) => {
        if (cache.clipState !== '' && !unDestoryClipAction[action.type]) {
            let list = store.getters.selectList
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].type === CLIP) {
                    store.commit(mutationTypes.DELETE_SELECT, {
                        currentSheet: store.state.currentSheet,
                        select: list[i]
                    })
                    cache.clipState = ''
                    break
                }
            }
        }
    })
}

let unDestoryClipAction = {
    'SELECTS_UPDATESELECT': true,
    'ROWS_UPDATEACTIVEROWS': true,
    'COLS_UPDATEACTIVECOLS': true,
    'CELLS_INNERPASTE': true,
    'CELLS_INSERTCELL': true,
    'CELLS_PASTE': true,
    'SELECTS_INSERT': true,
    'HISTORY_ADD': true
}