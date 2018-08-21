import {
    SWITCH_NAME
} from './mutation-type'
export default {
    [SWITCH_NAME](state, name) {
        console.log(name)
        state.activeName = name
    }
}