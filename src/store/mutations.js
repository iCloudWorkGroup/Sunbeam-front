import {
    UPDATE_ACTIVESHEET
} from './mutation-types'

export default {
    [UPDATE_ACTIVESHEET](state, alias) {
        state.currentSheet = alias
    }
}