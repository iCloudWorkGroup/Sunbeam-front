import {
    INSERT_SELECT,
    UPDATE_SELECT,
    DELETE_SELECT,
    M_SELECT_UPDATE_STATE
} from '../../mutation-types'
import extend from '../../../util/extend'
export default {
    /**
     * 允许批量插入多个选择区域
     */
    [INSERT_SELECT](state, selects) {
        let fixSelects = Array.isArray(selects) === true ?
            selects : [selects]
        for (let i = 0, len = fixSelects.length; i < len; i++) {
            state.list.push(fixSelects[i])
        }
    },
    /**
     * 只能进行单个更新
     */
    [UPDATE_SELECT](state, select) {
        if (state.selectState === 'select') {
            extend(true, state.list[0], select)
        } else {
            extend(true, state.list[1], select)
        }
        // for (let i = 0, len = state.list.length; i < len; i++) {
        //     let item = state.list[i]
        //     for (let name in select) {
        //         if (item[name]) {
        //             item[name] = select[name]
        //         }
        //     }
        // }
    },
    /**
     * 更新选择区域状态
     */
    [M_SELECT_UPDATE_STATE](state, type) {
        state.selectState = type
    },
    [DELETE_SELECT](state, payload) {
        let select = payload.select
        let list = state.list
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i] === select) {
                list.splice(i, 1)
                break
            }
        }
    }
}