import cfg from '../config'
import cache from './cache'
import extend from '../util/extend'
import send from '../util/send'
import rowTemplate from '../store/modules/rows/template'
import colTemplate from '../store/modules/cols/template'
import generator from './generator'
import {
    getColDisplayName,
    getRowDisplayName
} from '../util/displayname'

/**
 * 初始化/请求表格数据
 * @param  {Object}   viewBox 视图盒模型大小
 * @param  {Function} fn      数据处理函数
 * @return {[type]}           [description]
 */
export default function(viewBox, fn) {
    let build = true
    if (build === true) {
        buildSBM(fn)
        return
    }
    restoreSBM(viewBox, fn)
}


function buildSBM(fn, resolve) {
    let rows = []
    let cols = []
    let cells = []
    let colRecord = cache.colRecord
    let rowRecord = cache.rowRecord
    let sheet

    sheet = {
        alias: 'sheet1',
        name: 'sheet1'
    }

    let rowHeight = cfg.rowHeight
    for (let i = 0, len = cfg.initRowNum; i < len; i++) {
        rows.push(extend({}, rowTemplate, {
            alias: generator.rowAliasGenerator(),
            displayName: getRowDisplayName(i),
            top: i * (rowHeight + 1),
            sort: i
        }))
    }
    let colWidth = cfg.colWidth
    for (let i = 0, len = cfg.initColNum; i < len; i++) {
        cols.push(extend({}, colTemplate, {
            alias: generator.colAliasGenerator(),
            displayName: getColDisplayName(i),
            left: i * (colWidth + 1),
            sort: i
        }))
    }
    colRecord.push(cols[0].alias, cols[cols.length - 1].alias)
    rowRecord.push(rows[0].alias, rows[rows.length - 1].alias)

    fn({
        rows,
        cols,
        cells,
        sheet
    })
}

function restoreSBM(data, fn, resolve) {
    let cols = []
    let rows = []
    let cells = []
    let colRecord = cache.colRecord
    let rowRecord = cache.rowRecord
    let sheet

    send({
        url: 'reload',
        async: false,
        data: JSON.stringify(data),
        success(data) {
            if (!data || !data.returndata) {
                return
            }

            let sheetData

            cache.localRowPosi = data.maxRowPixel
            cache.localColPosi = data.maxColPixel

            generator.rowAliasGenerator(parseInt(data.aliasRowCounter,
                10))
            generator.colAliasGenerator(parseInt(data.aliasColCounter,
                10))

            let mainData = data.returndata

            if (mainData.spreadSheet && mainData.spreadSheet[0] &&
                (sheetData = mainData.spreadSheet[0].sheet)) {

                sheet = {
                    alias: sheetData.alias || 'sheet1',
                    name: sheetData.name
                }
                rows = sheetData.glY
                cols = sheetData.glX
                cells = sheetData.cells

                rows.forEach(function(row) {
                    row.sort = row.index
                    row.displayName = getRowDisplayName(row.sort)
                    row.alias = row.aliasY
                })
                cols.forEach(function(col) {
                    col.sort = col.index
                    col.displayName = getColDisplayName(col.sort)
                    col.alias = col.aliasX
                })
                cells.forEach(function(cell) {
                    cell.occupy.col = cell.occupy.x
                    cell.occupy.row = cell.occupy.y
                })
                colRecord.push(cols[0].alias, cols[cols.length - 1].alias)
                rowRecord.push(rows[0].alias, rows[rows.length - 1].alias)

                cache.regionRecord.set(
                    colRecord[0] + '_' +
                    colRecord[1] + '_' +
                    rowRecord[0] + '_' +
                    rowRecord[1], true)

                fn({
                    sheet,
                    rows,
                    cols,
                    cells
                })
            }
        }
    })
}