import {
    RESTORE,
    SHEET_INSERT,
    ROWS_ADD,
    COLS_ADD,
    CELLS_INSERT,
    SELECTS_INSERT,
    VIEWS_INIT
} from './action-types'
import cache from '../tools/cache'
import send from '../util/send'
import generator from '../tools/generator'
import {
    getColDisplayName,
    getRowDisplayName
} from '../util/displayname'

export default {
    [RESTORE]({
        dispatch,
        commit,
        getters
    }, area) {
        // 整理数据
        return send({
            url: 'reload',
            body: JSON.stringify(area),
        }, false).then((data) => {
            let bookItem
            if (data == null || (bookItem = data.sheets[0]) == null) {
                throw new Error(
                    'backend data failed from server')
            }

            let rows = bookItem.gridLineRow
            let cols = bookItem.gridLineCol
            let cells = bookItem.cells

            cache.localRowPosi = bookItem.maxRowPixel
            cache.localColPosi = bookItem.maxColPixel

            generator.rowAliasGenerator(parseInt(bookItem.maxRowAlias,
                0))
            generator.colAliasGenerator(parseInt(bookItem.maxColAlias,
                0))
            generator.cellAliasGenerator(0)

            rows.forEach(function(row) {
                row.displayName = getRowDisplayName(row
                    .sort)
            })
            cols.forEach(function(col) {
                col.displayName = getColDisplayName(col
                    .sort)
            })
            cells.forEach(function(cell) {
                cell.alias = generator.cellAliasGenerator()
            })
            dispatch(VIEWS_INIT, {
                rows,
                cols,
                maxColAlias: bookItem.maxColAlias,
                maxColPixel: bookItem.maxColPixel,
                maxRowAlias: bookItem.maxRowAlias,
                maxRowPixel: bookItem.maxRowPixel
            })
            dispatch(ROWS_ADD, rows)
            dispatch(COLS_ADD, cols)
            dispatch(CELLS_INSERT, cells)
            dispatch(SHEET_INSERT, {
                alias: bookItem.alias || '0',
                name: bookItem.name,
                frozen: bookItem.frozen
            })
            let visibleRows = getters.visibleRowList()
            let visibleCols = getters.visibleColList()
            dispatch(SELECTS_INSERT, {
                colAlias: visibleCols[0].alias,
                rowAlias: visibleRows[0].alias
            })
        })
    }
}