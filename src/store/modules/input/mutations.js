import extend from '../../../util/extend'
import template from './template'

export default {
    M_INPUT_UPDATE_PROPS(state, props) {
        extend(true, state.box, props)
    },
    M_INPUT_CREATE(state) {
        state.box = extend(template)
    },
    M_INPUT_UPDATE_STATUS(state, isedit) {
        state.box.assist.status = isedit
    },
    M_INPUT_RESET(state) {
        extend(true, state.box, template)
    },
    M_INPUT_SATTUS(state, status) {
        state.editStatus = status
    }
}