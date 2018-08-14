import {
    VIEWS_INIT
} from '../../action-types'
import {
    ADD_VIEW_LOADED,
    UPDATE_VIEW_ALIAS,
    UPDATE_VIEW_MAX
} from '../../mutation-types'
export default {
    /**
     * 初始化所有view信息，
     * 1. 已经加载过的坐标点，记录
     * 2. 数据被显示的范围
     */
    [VIEWS_INIT]({
        state,
        commit
    }, {
        rows,
        cols,
        maxColAlias,
        maxColPixel,
        maxRowAlias,
        maxRowPixel
    }) {
        let firstRow = rows[0].alias
        let firstCol = cols[0].alias
        let lastRow = rows[rows.length - 1].alias
        let lastCol = cols[cols.length - 1].alias
        commit(ADD_VIEW_LOADED, {
            colAlias: lastCol,
            rowAlias: lastRow
        })
        commit(UPDATE_VIEW_ALIAS, {
            startRow: firstRow,
            startCol: firstCol,
            overRow: lastRow,
            overCol: lastCol
        })
        commit(UPDATE_VIEW_MAX, {
            rowAlias: maxRowAlias,
            colAlias: maxColAlias,
            rowPixel: maxRowPixel,
            colPixed: maxColPixel
        })
    }
}