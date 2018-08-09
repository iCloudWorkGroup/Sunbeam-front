import extend from '../../../util/extend'
import {
    UPDATE_EDIT
} from '../../mutation-types'
import template from './template'

export default {
    [UPDATE_EDIT](state, props) {
        extend(template, props)
    }
}