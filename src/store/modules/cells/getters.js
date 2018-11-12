import {
    indexAttrBinary
} from '../../../util/binary'
import extend from '../../../util/extend'
import template from './template'
import {
    SELECT
} from '../../../tools/constant'
export default {
    cells(state) {
        return state.list
    },
    visibleCells(state) {
        return state.list.filter((cell) => {
            let status = cell.status
            return !status.hidden &&
                !status.destroy &&
                status.visible
        })
    },
    /**
     * 根据行、列别名去查找单元格
     * 一般用于查抄选择区域的activeCell
     * 如果没有单元格，就返回 null
     */
    getCellByAlias(state, getters) {
        return function({
            rowAlias,
            colAlias
        }) {
            let idx = getters.IdxByRow(colAlias, rowAlias)
            if (idx === -1) {
                return null
            }
            return state.list[idx]
        }
    },
    /**
     * 选中区域的第一个单元格属性
     * 如果没有就返回为单元格默认属性
     *
     * 以后增加：还没有涉及选中的类型
     *
     * 监听所有单元格(state.list)的变化
     * 实现选择区域不变时 computed的触发
     */
    activeCell(state, getters) {
        return function() {
            let cells = state.list
            let select = getters.selectByType('SELECT')
            let activePosi = select.activePosi
            let idx = this.IdxByRow(activePosi.colAlias, activePosi.rowAlias)
            if (idx !== -1) {
                return cells[idx]
            }
            return null
        }
    },
    /**
     * 返回单元格的默认属性
     * @return {[type]} [description]
     */
    templateCell() {
        return extend(template)
    },
    getClipData(state, getters) {
        return function() {
            let select = getters.selectByType('CLIP')
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let temp = {}
            let result = ''
            let cells = getters.cells
            let cols = getters.allCols
            let rows = getters.allRows
            for (let i = startRowIndex; i < endRowIndex + 1; i++) {
                for (let j = startColIndex; j < endColIndex + 1; j++) {
                    let aliasCol = cols[j].alias
                    let aliasRow = rows[i].alias
                    let cellIndex = getters.IdxByCol(aliasCol, aliasRow)
                    if (cellIndex !== -1 && !temp[cellIndex]) {
                        let cell = cells[cellIndex]
                        result = cell.content.texts == null ? null : result + cell.content.texts
                        temp[cellIndex] = true
                    }
                    if (j !== endColIndex) {
                        result += '\t'
                    }
                }
                result += '\n'
            }
            return result
        }
    },
    getOperRegion(state, getters, rootState) {
        return function() {
            let select = getters.activeSelect()
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            return {
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            }
        }
    },
    /**
     * 返回合法的操作区域
     * 区域内只能包含完整的单元格
     */
    fullRegion(state, getters, rootState) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex
        }) {

            // 用于接受参数修正
            let startCol
            let startRow
            let endCol
            let endRow

            // 修正查找位置信息
            // 因为用户可以自下向上选择，所以开始值
            // 不一定小于结束值
            // 但是在查找位置信息的时候，需要按照从小到大
            // 进行查找，所以需要修正传入坐标
            if (endColIndex < startColIndex) {
                startCol = endColIndex
                endCol = startColIndex
            } else {
                startCol = startColIndex
                endCol = endColIndex
            }
            if (endRowIndex < startRowIndex) {
                startRow = endRowIndex
                endRow = startRowIndex
            } else {
                startRow = startRowIndex
                endRow = endRowIndex
            }
            let cells = getters.cellsByVertical({
                startColIndex: startCol,
                startRowIndex: startRow,
                endColIndex: endCol,
                endRowIndex: endRow
            })
            let len = cells.length
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    let cell = cells[i]
                    let occupyCols = cell.occupy.col
                    let occupyRows = cell.occupy.row
                    let firstRow = occupyRows[0]
                    let lastRow = occupyRows[occupyRows.length - 1]
                    let firstCol = occupyCols[0]
                    let lastCol = occupyCols[occupyCols.length - 1]
                    let firstRowIdx = getters.rowIndexByAlias(firstRow)
                    let lastRowIdx = getters.rowIndexByAlias(lastRow)
                    let firstColIdx = getters.colIndexByAlias(firstCol)
                    let lastColIdx = getters.colIndexByAlias(lastCol)
                    startRow = firstRowIdx === -1 ? firstRowIdx :
                        Math.min(firstRowIdx, startRow)
                    startCol = firstColIdx === -1 ? firstColIdx :
                        Math.min(firstColIdx, startCol)
                    endRow = lastRowIdx === -1 ? lastRowIdx :
                        Math.max(lastRowIdx, endRow)
                    endCol = lastColIdx === -1 ? lastColIdx :
                        Math.max(lastColIdx, endCol)
                }
            }
            return {
                startColIndex: startCol,
                startRowIndex: startRow,
                endColIndex: endCol,
                endRowIndex: endRow
            }
        }
    },
    /**
     * 查选区域内所有单元格(垂直方向)
     */
    cellsByVertical(state, getters) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex,
        }) {
            let rows = getters.visibleRowList()
            let cols = getters.visibleColList()
            let allRows = getters.allRows
            let allCols = getters.allCols
            let endCol = endColIndex === -1 ?
                cols.length - 1 :
                endColIndex
            let endRow = endRowIndex === -1 ?
                rows.length - 1 :
                endRowIndex
            let result = []
            let avoidRepeat = {}

            let startCol = Math.max(startColIndex, cols[0].sort)
            let startRow = Math.max(startRowIndex, rows[0].sort)
            let endColLen = Math.min(endCol, cols[cols.length - 1].sort)
            let endRowLen = Math.min(endRow, rows[rows.length - 1].sort)
            for (let i = startCol; i <= endColLen; i++) {
                for (let j = startRow; j <= endRowLen; j++) {
                    let colAlias = allCols[i].alias
                    let rowAlias = allRows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        result.push(state.list[idx])
                    }
                }
            }
            return result
        }
    },
    /**
     * 查选操作区域下侧/右侧所有单元格
     */
    cellsByOpr(state, getters) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex,

        }) {
            let allRows = getters.allRows
            let allCols = getters.allCols
            let result = []
            let avoidRepeat = {}

            let startCol = startColIndex
            let startRow = startRowIndex
            let endColLen = allCols[allCols.length - 1].sort
            let endRowLen = allRows[allRows.length - 1].sort
            for (let i = startCol; i <= endColLen; i++) {
                for (let j = startRow; j <= endRowLen; j++) {
                    let colAlias = allCols[i].alias
                    let rowAlias = allRows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        result.push(state.list[idx])
                    }
                }
            }
            return result
        }
    },
    /**
     * 查选区域内所有可视单元格(垂直方向)
     */
    cellsByVerticalShouldShow(state, getters) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex,

        }) {
            // 监听单元格长度，
            let cells = state.list
            let rows = getters.visibleRowList()
            let cols = getters.visibleColList()
            let allRows = getters.allRows
            let allCols = getters.allCols
            let endCol = endColIndex === -1 ?
                cols.length - 1 :
                endColIndex
            let endRow = endRowIndex === -1 ?
                rows.length - 1 :
                endRowIndex
            let result = []
            let avoidRepeat = {}
            let startCol = Math.max(startColIndex, cols[0].sort)
            let startRow = Math.max(startRowIndex, rows[0].sort)
            let endColLen = Math.min(endCol, cols[cols.length - 1].sort)
            let endRowLen = Math.min(endRow, rows[rows.length - 1].sort)
            for (let i = startCol; i <= endColLen; i++) {
                for (let j = startRow; j <= endRowLen; j++) {
                    let colAlias = allCols[i].alias
                    let rowAlias = allRows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx] && !cells[idx].status.hidden && !cells[idx].status.destroy
                        && cells[idx].physicsBox.width !== 0 && cells[idx].physicsBox.height !== 0) {
                        avoidRepeat[idx] = true
                        result.push(cells[idx])
                    }
                }
            }
            return result
        }
    },
    /**
     * 查选区域内所有可视且有批注的单元格(垂直方向)
     */
    cellsByVerticalHasComment(state, getters) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex,
        }) {
            // 监听单元格长度，
            let cells = state.list
            let rows = getters.visibleRowList()
            let cols = getters.visibleColList()
            let allRows = getters.allRows
            let allCols = getters.allCols
            let endCol = endColIndex === -1 ?
                cols.length - 1 :
                endColIndex
            let endRow = endRowIndex === -1 ?
                rows.length - 1 :
                endRowIndex
            let result = []
            let avoidRepeat = {}
            let startCol = Math.max(startColIndex, cols[0].sort)
            let startRow = Math.max(startRowIndex, rows[0].sort)
            let endColLen = Math.min(endCol, cols[cols.length - 1].sort)
            let endRowLen = Math.min(endRow, rows[rows.length - 1].sort)
            for (let i = startCol; i <= endColLen; i++) {
                for (let j = startRow; j <= endRowLen; j++) {
                    let colAlias = allCols[i].alias
                    let rowAlias = allRows[j].alias
                    let idx = getters.IdxByRow(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx]) {
                        if (!cells[idx].status.hidden && !cells[idx].status.destroy && cells[idx].customProp.comment != null && cells[idx].customProp.comment !== '') {
                            avoidRepeat[idx] = true
                            result.push(cells[idx])
                        }
                    }
                }
            }
            return result
        }
    },
    cellsByTransverse(state, getters, rootState) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex
        }) {
            let rows = getters.allRows
            let cols = getters.allCols
            let startCol = startColIndex
            let startRow = startRowIndex
            let endCol = endColIndex === -1 ? cols.length - 1 : endColIndex
            let endRow = endRowIndex === -1 ? rows.length - 1 : endRowIndex
            let result = []
            let avoidRepeat = {}
            for (let i = startRow, rowLen = endRow + 1; i < rowLen; i++) {
                for (let j = startCol, colLen = endCol + 1; j < colLen; j++) {
                    let rowAlias = rows[i].alias
                    let colAlias = cols[j].alias
                    let idx = getters.IdxByCol(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx]) {
                        avoidRepeat[idx] = true
                        result.push(state.list[idx])
                    }
                }
            }
            return result
        }
    },
    cellsByTransverseHaveTexts(state, getters, rootState) {
        return function({
            startColIndex,
            startRowIndex,
            endColIndex = startColIndex,
            endRowIndex = startRowIndex
        }) {
            let rows = getters.allRows
            let cols = getters.allCols
            let startCol = startColIndex
            let startRow = startRowIndex
            let endCol = endColIndex === -1 ? cols.length - 1 : endColIndex
            let endRow = endRowIndex === -1 ? rows.length - 1 : endRowIndex
            let result = []
            let avoidRepeat = {}
            for (let i = startRow, rowLen = endRow + 1; i < rowLen; i++) {
                for (let j = startCol, colLen = endCol + 1; j < colLen; j++) {
                    let rowAlias = rows[i].alias
                    let colAlias = cols[j].alias
                    let idx = getters.IdxByCol(colAlias, rowAlias)
                    if (idx !== -1 && !avoidRepeat[idx] && state.list[idx].content.texts != null && state.list[idx].content.texts !== '') {
                        avoidRepeat[idx] = true
                        result.push(state.list[idx])
                    }
                }
            }
            if (result.length === 0) {
                let rowAlias = rows[startRow].alias
                let colAlias = cols[startCol].alias
                let idx = getters.IdxByCol(colAlias, rowAlias)
                if (idx !== -1 && !avoidRepeat[idx]) {
                    avoidRepeat[idx] = true
                    result.push(state.list[idx])
                }
            }
            return result
        }
    },
    topRegionCellList(state, getters, rootState) {
        return function() {
            let rules = getters.frozenState.rules
            if (!rules.length) {
                return
            }
            let userView = rootState.userView
            let startRowIndex
            let endRowIndex
            let startColIndex
            let endColIndex
            let rule

            for (let i = 0, len = rules.length; i < len; i++) {
                rule = rules[i]
                if (rule.type === 'topRule') {
                    break
                }
            }

            startRowIndex = rule.startRowIndex
            endRowIndex = rule.endRowIndex
            startColIndex = getters.getColIndexByPosi(userView.left)
            endColIndex = getters.getColIndexByPosi(userView.right)

            return getters.cellsByVertical({
                startRowIndex,
                endRowIndex,
                startColIndex,
                endColIndex
            })
        }
    },
    leftRegionCellList(state, getters, rootState) {
        return function() {
            let rules = getters.frozenState.rules
            if (!rules.length) {
                return
            }
            let userView = rootState.userView
            let startRowIndex
            let endRowIndex
            let startColIndex
            let endColIndex
            let rule

            for (let i = 0, len = rules.length; i < len; i++) {
                rule = rules[i]
                if (rule.type === 'leftRule') {
                    break
                }
            }
            startRowIndex = getters.getRowIndexByPosi(userView.top)
            endRowIndex = getters.getRowIndexByPosi(userView.bottom)
            startColIndex = rule.startColIndex
            endColIndex = rule.endColIndex

            return getters.cellsByVertical({
                startRowIndex,
                endRowIndex,
                startColIndex,
                endColIndex
            })
        }
    },
    userViewCellList(state, getters, rootState) {
        return function() {
            let userView = rootState.userView
            let visibleColList = getters.visibleColList
            let visibleRowList = getters.visibleRowList
            let cols = getters.colList
            let rows = getters.rowList
            let startRowIndex = getters.getRowIndexByPosi(userView.top)
            let endRowIndex = getters.getRowIndexByPosi(userView.bottom)
            let startColIndex = getters.getColIndexByPosi(userView.left)
            let endColIndex = getters.getColIndexByPosi(userView.right)

            startRowIndex = indexAttrBinary(rows[startRowIndex].sort,
                visibleRowList, 'sort')
            endRowIndex = indexAttrBinary(rows[endRowIndex].sort,
                visibleRowList,
                'sort')
            startColIndex = indexAttrBinary(cols[startColIndex].sort,
                visibleColList, 'sort')
            endColIndex = indexAttrBinary(cols[endColIndex].sort,
                visibleColList,
                'sort')
            return getters.cellsByVertical({
                startRowIndex,
                endRowIndex,
                startColIndex,
                endColIndex,
                cols: visibleColList,
                rows: visibleRowList
            })
        }
    },
    /**
     * 是否包含合并单元格
     * @param  {[type]}  state   [description]
     * @param  {[type]}  getters [description]
     * @return {Boolean}         [description]
     */
    hasMergeCell(state, getters) {
        return function() {
            let allCells = state.list
            let selects = getters.allSelects
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            if (startColIndex === endColIndex &&
                startRowIndex === endRowIndex) {
                return false
            }
            let verticalCells = getters.cellsByVertical({
                startColIndex,
                startRowIndex,
                endColIndex,
                endRowIndex
            })
            for (let i = 0, len = verticalCells.length; i < len; i++) {
                let cell = verticalCells[i] || allCells
                if (cell.occupy.row.length > 1 ||
                    cell.occupy.col.length > 1) {
                    return true
                }
            }
            return false
        }
    },
    /**
     * 是否包含锁定单元格
     * @param  {[type]}  state   [description]
     * @param  {[type]}  getters [description]
     * @return {Boolean}         [description]
     */
    hasLockCell(state, getters) {
        return function() {
            let allCells = state.list
            let selects = getters.allSelects
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            let verticalCells = getters.cellsByVertical({
                startColIndex,
                startRowIndex,
                endColIndex,
                endRowIndex
            })
            for (let i = 0, len = verticalCells.length; i < len; i++) {
                let cell = verticalCells[i] || allCells
                if (cell.content.locked) {
                    return true
                }
            }
            if (verticalCells.length === 0) {
                return true
            }
            return false
        }
    },
    /**
     * 是否包含锁定单元格
     * @param  {[type]}  state   [description]
     * @param  {[type]}  getters [description]
     * @return {Boolean}         [description]
     */
    cellValidation(state, getters) {
        return function() {
            let allCells = state.list
            let selects = getters.allSelects
            let select
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i]
                    break
                }
            }
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let endColIndex = getters.colIndexByAlias(wholePosi.endColAlias)
            let endRowIndex = getters.rowIndexByAlias(wholePosi.endRowAlias)
            let verticalCells = getters.cellsByVertical({
                startColIndex,
                startRowIndex,
                endColIndex,
                endRowIndex
            })
            for (let i = 0, len = verticalCells.length; i < len; i++) {
                let cell = verticalCells[i] || allCells
                return cell.content.ruleIndex
            }
            if (verticalCells.length === 0) {
                return null
            }
            return null
        }
    },
    /**
     * 选中单元格是否换行
     * @param  {[type]}  state   [description]
     * @param  {[type]}  getters [description]
     * @return {Boolean}         [description]
     */
    isWordWrapCell(state, getters) {
        return function() {
            let length = state.list.length
            let select = getters.selectByType(SELECT)
            let wholePosi = select.wholePosi
            let startColIndex = getters.colIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.rowIndexByAlias(wholePosi.startRowAlias)
            let verticalCells = getters.cellsByVertical({
                startColIndex,
                startRowIndex,
                endColIndex: startColIndex,
                endRowIndex: startRowIndex
            })
            for (let i = 0, len = Math.min(verticalCells.length, length); i < len; i++) {
                let cell = verticalCells[i]
                return cell.content.wordWrap
            }
            return false
        }
    },
    /**
     * 根据行列别名查找单元格的索引，
     * 以行为查找方向
     */
    IdxByRow: function(state) {
        return function(colAlias, rowAlias) {
            let map = state.rowMap
            return map.get(rowAlias) != null &&
                map.get(rowAlias).get(colAlias) != null ?
                map.get(rowAlias).get(colAlias) :
                -1
        }
    },
    /**
     * 根据行列别名查找单元格的索引，
     * 以为查找方向
     */
    IdxByCol: function(state) {
        return function(colAlias, rowAlias) {
            let map = state.colMap
            return map.get(colAlias) != null &&
                map.get(colAlias).get(rowAlias) != null ?
                map.get(colAlias).get(rowAlias) :
                -1
        }
    },
    /**
     * 获取鼠标所在处有批注的单元格
     */
    mouseInCell: function (state) {
        return state.mouseInCell
    }
}