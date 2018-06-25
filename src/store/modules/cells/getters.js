import { indexAttrBinary } from '../../../util/binary'
import extend from '../../../util/extend'
import template from './template'

export default {
    cellList(state, getters, rootState) {
        let currentSheet = rootState.currentSheet
        let result = state[currentSheet]
        return result
    },
    getSelectCell(state, getters, rootState) {
        let select = getters.activeSelect
        let wholePosi = select.wholePosi
        let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
        let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
        let endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
        let endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
        let cellList

        cellList = getters.getCellsByTransverse({
            startColIndex,
            startRowIndex,
            endRowIndex,
            endColIndex
        })

        if (cellList.length === 0) {
            return extend({}, template)
        } else {
            return extend({}, cellList[0])
        }
    },
    /**
     * 返回合法的操作区域
     * 区域内只能包含完整的单元格
     */
    getFullOprRegion(state, getters, rootState) {
        return function(payload) {
            let {
                startColIndex,
                startRowIndex,
                endColIndex = startColIndex,
                endRowIndex = startRowIndex
            } = payload
            let cellStartColIndex
            let cellStartRowIndex
            let cellEndColIndex
            let cellEndRowIndex
            let cellList
            let flag = true

            if (startColIndex === 'MAX' || endColIndex === 'MAX') {
                return {
                    startRowIndex: startRowIndex,
                    startColIndex: 0,
                    endRowIndex: endRowIndex,
                    endColIndex: 'MAX'
                }
            }
            if (startRowIndex === 'MAX' || endRowIndex === 'MAX') {
                return {
                    startRowIndex: 0,
                    startColIndex: startColIndex,
                    endColIndex: endColIndex,
                    endRowIndex: 'MAX'
                }
            }
            if (startRowIndex > endRowIndex) {
                [startRowIndex, endRowIndex] = [endRowIndex, startRowIndex]
            }
            if (startColIndex > endColIndex) {
                [startColIndex, endColIndex] = [endColIndex, startColIndex]
            }

            let temp = new Map()
            while (flag) {
                flag = false
                cellList = getters.getCellsByVertical({
                    startColIndex,
                    startRowIndex,
                    endColIndex,
                    endRowIndex
                })

                for (let i = 0, len = cellList.length; i < len; i++) {
                    let cell = cellList[i]
                    if (temp.get(cell.alias)) {
                        break
                    }
                    temp.set(cell.alias, true)

                    let occupyCol = cell.occupy.col
                    let occupyRow = cell.occupy.row

                    cellStartRowIndex = getters.getRowIndexByAlias(occupyRow[0])
                    cellEndRowIndex = getters.getRowIndexByAlias(occupyRow[occupyRow.length - 1])

                    cellStartColIndex = getters.getColIndexByAlias(occupyCol[0])
                    cellEndColIndex = getters.getColIndexByAlias(occupyCol[occupyCol.length - 1])

                    if (cellStartColIndex < startColIndex) {
                        startColIndex = cellStartColIndex
                        flag = true
                    }
                    if (cellStartRowIndex < startRowIndex) {
                        startRowIndex = cellStartRowIndex
                        flag = true
                    }
                    if (cellEndRowIndex > endRowIndex) {
                        endRowIndex = cellEndRowIndex
                        flag = true
                    }
                    if (cellEndColIndex > endColIndex) {
                        endColIndex = cellEndColIndex
                        flag = true
                    }
                }
            }
            return {
                startRowIndex,
                startColIndex,
                endRowIndex,
                endColIndex
            }
        }
    },
    /**
     * 查选区域内所有单元格(垂直方向)
     */
    getCellsByVertical(state, getters, rootState) {
        let currentSheet = rootState.currentSheet
        let cells = state[currentSheet]

        return function(payload) {
            let {
                startColIndex,
                startRowIndex,
                endColIndex = startColIndex,
                endRowIndex = startRowIndex,
                cols,
                rows
            } = payload

            let result = []
            let pointInfo = rootState.pointsInfo[currentSheet].col
            let index
            let temp
            let tempObj = {}
            let rowAlias
            let colAlias

            rows = rows || getters.rowList
            cols = cols || getters.colList
            endColIndex = endColIndex === 'MAX' ? cols.length - 1 :
                endColIndex
            endRowIndex = endRowIndex === 'MAX' ? rows.length - 1 :
                endRowIndex

            for (let i = startColIndex, len1 = endColIndex + 1; i < len1; i++) {
                colAlias = cols[i].alias
                if (typeof pointInfo[colAlias] !== 'undefined') {
                    for (let j = startRowIndex, len2 = endRowIndex + 1; j <
                        len2; j++) {
                        rowAlias = rows[j].alias
                        temp = pointInfo[colAlias][rowAlias]
                        if (temp && temp.cellIndex !== null) {
                            index = temp.cellIndex
                            if (!tempObj[index]) {
                                result.push(cells[index])
                                tempObj[index] = 1
                            }
                        }
                    }
                }
            }
            return result
        }
    },
    getCellsByTransverse(state, getters, rootState) {
        let currentSheet = rootState.currentSheet
        let cells = state[currentSheet]

        return function(payload) {
            let {
                startColIndex,
                startRowIndex,
                endColIndex = startColIndex,
                endRowIndex = startRowIndex,
                cols,
                rows
            } = payload
            let result = []
            let pointInfo = rootState.pointsInfo[currentSheet].row
            let index
            let temp
            let tempObj = {}
            let rowAlias
            let colAlias

            rows = rows || getters.rowList
            cols = cols || getters.colList
            endColIndex = endColIndex === 'MAX' ? cols.length - 1 :
                endColIndex
            endRowIndex = endRowIndex === 'MAX' ? rows.length - 1 :
                endRowIndex

            for (let i = startRowIndex, len1 = endRowIndex + 1; i < len1; i++) {
                rowAlias = rows[i].alias
                if (typeof pointInfo[rowAlias] !== 'undefined') {
                    for (let j = startColIndex, len2 = endColIndex + 1; j <
                        len2; j++) {
                        colAlias = cols[j].alias
                        temp = pointInfo[rowAlias][colAlias]
                        if (temp && temp.cellIndex !== null) {
                            index = temp.cellIndex
                            if (!tempObj[index]) {
                                result.push(cells[index])
                                tempObj[index] = true
                            }
                        }
                    }
                }
            }
            return result
        }
    },
    topRegionCellList(state, getters, rootState) {
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

        return getters.getCellsByVertical({
            startRowIndex,
            endRowIndex,
            startColIndex,
            endColIndex
        })
    },
    leftRegionCellList(state, getters, rootState) {
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

        return getters.getCellsByVertical({
            startRowIndex,
            endRowIndex,
            startColIndex,
            endColIndex
        })
    },
    userViewCellList(state, getters, rootState) {
        let userView = rootState.userView
        let cols = getters.colList
        let rows = getters.rowList
        let visibleColList = getters.visibleColList
        let visibleRowList = getters.visibleRowList
        let startRowIndex = getters.getRowIndexByPosi(userView.top)
        let endRowIndex = getters.getRowIndexByPosi(userView.bottom)
        let startColIndex = getters.getColIndexByPosi(userView.left)
        let endColIndex = getters.getColIndexByPosi(userView.right)

        startRowIndex = indexAttrBinary(rows[startRowIndex].sort,
            visibleRowList, 'sort')
        endRowIndex = indexAttrBinary(rows[endRowIndex].sort, visibleRowList,
            'sort')
        startColIndex = indexAttrBinary(cols[startColIndex].sort,
            visibleColList, 'sort')
        endColIndex = indexAttrBinary(cols[endColIndex].sort, visibleColList,
            'sort')

        return getters.getCellsByVertical({
            startRowIndex,
            endRowIndex,
            startColIndex,
            endColIndex,
            cols: visibleColList,
            rows: visibleRowList
        })
    },
    getMergeState(state, getters, rootState) {
        return function() {
            let wholePosi = getters.activeSelect.wholePosi
            let startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            let startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            let endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            let endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)

            if (startColIndex === endColIndex && startRowIndex ===
                endRowIndex) {
                return false
            }
            let cellList = getters.getCellsByVertical({
                startColIndex,
                startRowIndex,
                endColIndex,
                endRowIndex
            })
            for (let i = 0, len = cellList.length; i < len; i++) {
                let cell = cellList[i]
                let occupyCol = cell.occupy.col
                let occupyRow = cell.occupy.row
                if (occupyRow.length > 1 || occupyCol.length > 1) {
                    return true
                }
            }
            return false
        }
    }
}