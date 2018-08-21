import {
    M_INSERT_CELL,
    UPDATE_CELL,
    M_UPDATE_POINTS,
    M_DESTORY_CELL
} from '../../mutation-types'
import extend from '../../../util/extend'

export default {
    [M_INSERT_CELL](state, cell) {
        state.list.push(cell)
    },
    [UPDATE_CELL](state, {
        idx,
        prop
    }) {
        let cell = state.list[idx]
        state.list[idx] = extend(true, cell, prop)
    },
    /**
     * 更新单元格对应关系表
     */
    [M_UPDATE_POINTS](state, {
        occupyCols,
        occupyRows,
        cellIdx
    }) {
        for (let j = 0; j < occupyCols.length; j++) {
            for (let k = 0; k < occupyRows.length; k++) {
                let col = occupyCols[j]
                let row = occupyRows[k]
                // 列Map填充
                let colItemMap
                let colMap = state.colMap
                if (colMap.get(col) == null) {
                    colItemMap = new Map()
                    colMap.set(col, colItemMap)
                } else {
                    colItemMap = colMap.get(col)
                }
                colItemMap.set(row, cellIdx)

                // 行Map填充
                let rowMap = state.rowMap
                let rowItemMap
                if (rowMap.get(row) == null) {
                    rowItemMap = new Map()
                    rowMap.set(row, rowItemMap)
                } else {
                    rowItemMap = rowMap.get(row)
                }
                rowItemMap.set(col, cellIdx)
            }
        }
    },
    /**
     * 根据索引销毁单元格
     */
    [M_DESTORY_CELL](state, cell) {
        cell.status.destory = true
    }
}