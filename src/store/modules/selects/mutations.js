import {
    INSERT_SELECT,
    UPDATE_SELECT,
    DELETE_SELECT
} from '../../mutation-types'
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
        for (let i = 0, len = state.list.length; i < len; i++) {
            let item = state.list[i]
            for (let name in select) {
                if (item[name]) {
                    item[name] = select[name]
                }
            }
        }
    },
    [DELETE_SELECT](state, payload) {
        let currentSheet = payload.currentSheet
        let select = payload.select
        let list = state[currentSheet].list
        for (let i = 0, len = list.length; i < len; i++) {
            if (list[i] === select) {
                list.splice(i, 1)
                break
            }
        }
    }
}