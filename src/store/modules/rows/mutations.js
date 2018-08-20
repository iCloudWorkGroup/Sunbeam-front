import {
    ADD_ROW,
    INSERT_ROW,
    ACTIVE_ROW,
    CANCEL_ACTIVE_ROW,
    UPDATE_ROW,
    DELETE_ROW
} from '../../mutation-types'
import {
    indexAttrBinary
} from '../../../util/binary'
import extend from '../../../util/extend'
import cellTemplate from '../cells/template'

export default {
    [ADD_ROW](state, payload) {
        let rows = payload.rows
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            state.list.push(row)
            state.map.set(row.alias, row)
        }
    },
    [INSERT_ROW](state, payload) {
        let rows = payload.rows
        let rowsState = state[payload.currentSheet]
        let list = rowsState.list
        let map = rowsState.map
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            let index = indexAttrBinary(row.sort, list, 'sort')
            list.splice(index, 0, row)
            map.set(row.alias, row)
        }
    },
    [CANCEL_ACTIVE_ROW](state) {
        let list = state.list
        for (let i = 0, len = list.length; i < len; i++) {
            list[i].active = false
        }
    },
    [ACTIVE_ROW](state, {
        startIndex,
        endIndex = startIndex
    }) {
        for (let j = startIndex; j <= endIndex; j++) {
            state.list[j].active = true
        }
    },
    [UPDATE_ROW](state, info) {
        info.forEach(function({
            row,
            props
        }) {
            extend(row, props)
            let rowOprProp = row.props
            clearDefaultValue(rowOprProp, cellTemplate)

            function clearDefaultValue(object, template) {
                let hasOwnProp = Object.prototype.hasOwnProperty
                for (let name in object) {
                    if (hasOwnProp.call(object, name)) {
                        let currentProp = object[name]
                        let defaultValue = template[name]
                        if (typeof currentProp === 'object') {
                            if (isEmptyObj(currentProp)) {
                                delete object[name]
                            } else {
                                let result = clearDefaultValue(
                                    currentProp, defaultValue)
                                if (result) {
                                    delete object[name]
                                }
                            }
                        } else if (currentProp === defaultValue) {
                            delete object[name]
                        }
                    }
                }
                return isEmptyObj(object)
            }

            function isEmptyObj(obj) {
                for (let name in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, name)) {
                        return false
                    }
                }
                return true
            }
        })
    },
    [DELETE_ROW](state, {
        currentSheet,
        index
    }) {
        let list = state[currentSheet].list
        list.splice(index, 1)
    },
    M_ROWS_UPDATE_VIEW(state, {
        isView,
        startIdx,
        overIdx
    }) {
        for (let i = startIdx; i < overIdx; i++) {
            state.list[i].view = isView
        }
    }
}