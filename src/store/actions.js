import {
    RESTORE,
    SHEET_INSERT,
    ROWS_ADD,
    COLS_ADD,
    SELECTS_INSERT,
    A_CLEAR_QUEUE
} from './action-types'
import cache from '../tools/cache'
import send from '../util/send'
import generator from '../tools/generator'
import config from '../config'

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
            cache.step = 0
            let bookItem
            if (data == null || (bookItem = data.sheets[0]) == null) {
                throw new Error('backend data failed from server')
            }
            let rows = bookItem.gridLineRow
            let cols = bookItem.gridLineCol
            let cells = bookItem.cells
            cache.localRowPosi = bookItem.maxRowPixel
            cache.localColPosi = bookItem.maxColPixel
            // 存储行、列别名的最大值，为后面再增加行、列生成列名做准备
            generator.rowAliasGenerator(parseInt(bookItem.maxRowAlias,
                0))
            generator.colAliasGenerator(parseInt(bookItem.maxColAlias,
                0))
            generator.cellAliasGenerator(0)

            // 模拟数据的行为
            // bookItem.frozen = {
            //     rowAlias: '5',
            //     colAlias: '5'
            // }
            // commit('M_SHEETS_ADD_LOADED', {
            //     colAlias: '6',
            //     rowAlias: '6'
            // })
            // 模拟数据行为结束
            commit('M_SHEETS_ADD_LOADED', {
                colAlias: cols[0].alias,
                rowAlias: rows[0].alias
            })
            commit('M_SHEETS_ADD_LOADED', {
                colAlias: cols[cols.length - 1].alias,
                rowAlias: rows[rows.length - 1].alias
            })
            commit('UPDATE_SHEETS_MAX', {
                colAlias: bookItem.maxColAlias,
                colPixel: bookItem.maxColPixel,
                rowAlias: bookItem.maxRowAlias,
                rowPixel: bookItem.maxRowPixel
            })
            dispatch(ROWS_ADD, rows)
            dispatch(COLS_ADD, cols)
            dispatch('A_CELLS_ADD', cells)
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
            commit('M_INPUT_CREATE')
            commit('M_UPDATE_LOAD', false)
        })
    },
    [A_CLEAR_QUEUE]({
        rootState,
        dispatch,
        commit,
        getters
    }) {
        // 整理数据
        send({
            url: config.url.clearqueue
        }, false)
    }
}