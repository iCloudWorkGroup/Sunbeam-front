import cache from './cache'
import send from '../util/send'
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
    restoreSBM(viewBox, fn)
}
function restoreSBM(data, fn, resolve) {
    let colRecord = cache.colRecord
    let rowRecord = cache.rowRecord

    send({
        url: 'reload',
        async: false,
        isPublic: false,
        data: JSON.stringify(data),
        success(data) {
            let sheet
            if (!data || !Array.isArray(data.sheets) || !(sheet = data.sheets[0])) {
                return
            }

            cache.localRowPosi = sheet.maxRowPixel
            cache.localColPosi = sheet.maxColPixel

            generator.rowAliasGenerator(parseInt(sheet.maxRowAlias, 0))
            generator.colAliasGenerator(parseInt(sheet.maxColAlias, 0))
            generator.cellAliasGenerator(0)

            let sheetData = {
                alias: sheet.alias || 'sheet1',
                name: sheet.name
            }
            let rowData = sheet.gridLineRow
            let colData = sheet.gridLineCol
            let cellData = sheet.cells
            let frozenData = sheet.frozen

            rowData.forEach(function(row) {
                row.displayName = getRowDisplayName(row.sort)
            })
            colData.forEach(function(col) {
                col.displayName = getColDisplayName(col.sort)
            })
            cellData.forEach(function(cell) {
                cell.alias = generator.cellAliasGenerator()
            })
            if (frozenData) {
                frozenData.type = 'restore'
                frozenData.viewColAlias = sheet.viewColAlias
                frozenData.viewRowAlias = sheet.viewRowAlias
            }
            colRecord.push(colData[0].alias, colData[colData.length - 1].alias)
            rowRecord.push(rowData[0].alias, rowData[rowData.length - 1].alias)

            cache.regionRecord.set(
                colRecord[0] + '_' +
                colRecord[1] + '_' +
                rowRecord[0] + '_' +
                rowRecord[1], true)

            fn({
                sheet: sheetData,
                rows: rowData,
                cols: colData,
                cells: cellData,
                frozen: frozenData
            })
        }
    })
}