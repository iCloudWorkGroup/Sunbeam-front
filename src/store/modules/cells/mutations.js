import {
    M_INSERT_CELL,
    UPDATE_CELL,
    M_UPDATE_POINTS,
    M_DESTORY_CELL,
    M_DELETE_POINTS
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
    M_CELLS_UPDATE_VIEW(state, {
        cells,
        propValue
    }) {
        let len = cells.length
        for (let i = 0; i < len; i++) {
            let item = cells[i]
            item.visible = propValue
        }
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
        cell.status.destroy = true
    },
    /**
     * 删除单元格对应关系
     */
    [M_DELETE_POINTS](state, {
        delOccupyCols,
        delOccupyRows
    }) {
        for (let j = 0; j < delOccupyCols.length; j++) {
            for (let k = 0; k < delOccupyRows.length; k++) {
                let col = delOccupyCols[j]
                let row = delOccupyRows[k]

                // 列Map删除
                let colMap = state.colMap
                if (colMap.get(col).get(row) !== null) {
                    colMap.get(col).delete(row)
                }
                if (colMap.get(col).size === 0) {
                    colMap.delete(col)
                }
                // 行Map删除
                let rowMap = state.rowMap
                if (rowMap.get(row).get(col) !== null) {
                    rowMap.get(row).delete(col)
                }
                if (rowMap.get(row).size === 0) {
                    rowMap.delete(row)
                }
            }
        }
    },
    M_CLEAR_CELLS(state) {
        state.list = []
        state.rowMap = new Map()
        state.colMap = new Map()
    },
    M_UPDATE_COMMENT_SATTUS(state, comment) {
        state.activeComment = comment
    }
}