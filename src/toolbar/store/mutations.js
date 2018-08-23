import {
    SWITCH_NAME
} from './mutation-type'
export default {
    [SWITCH_NAME](state, name) {
        state.activeName = name
    }
}