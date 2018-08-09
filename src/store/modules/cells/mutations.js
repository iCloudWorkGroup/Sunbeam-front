import {
    INSERT_CELL,
    UPDATE_CELL,
    UPDATE_POINTS
} from '../../mutation-types'
import extend from '../../../util/extend'

export default {
    [INSERT_CELL](state, cell) {
        state.list.push(cell)
    },
    [UPDATE_CELL](state, {
        idx,
        prop
    }) {
        let cell = state.list[idx]
        state.list[idx] = extend(true, cell, prop)
    },
    [UPDATE_POINTS](state, {
        colAlias,
        rowAlias,
        cellIdx
    }) {
        let rowMap = state.rowMap
        let colMap = state.colMap

        // 列Map填充
        let colTopVal
        if (colMap.get(colAlias) == null) {
            colTopVal = new Map()
            colMap.set(colAlias, colTopVal)
        } else {
            colTopVal = colMap.get(colAlias)
        }
        colTopVal.set(rowAlias, cellIdx)

        // 行Map填充
        let rowTopVal
        if (rowMap.get(rowAlias) == null) {
            rowTopVal = new Map()
            rowMap.set(rowAlias, rowTopVal)
        } else {
            rowTopVal = rowMap.get(rowAlias)
        }
        rowTopVal.set(colAlias, cellIdx)
    }
}