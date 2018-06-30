import * as actionTypes from '../../action-types'
import * as mutationTypes from '../../mutation-types'
import extend from '../../../util/extend'
import template from './template'
import generator from '../../../tools/generator'
import config from '../../../config'
import send from '../../../util/send'

export default {
    /**
     * 还原单元格, 由occupy生成盒模型信息
     */
    [actionTypes.CELLS_RESTORECELL]({
        commit,
        dispatch,
        state,
        rootState,
        getters
    }, payload) {
        let cellList = payload
        if (!Array.isArray(cellList)) {
            cellList = [cellList]
        }

        let sheet = rootState.currentSheet
        let cols = getters.colList
        let rows = getters.rowList
        let cells = getters.cellList
        let limitRowIndex = rows.length - 1
        let limitColIndex = cols.length - 1
        let getPointInfo = getters.getPointInfo
        let getColIndexByAlias = getters.getColIndexByAlias
        let getRowIndexByAlias = getters.getRowIndexByAlias

        for (let i = 0, len = cellList.length; i < len; i++) {
            let cell = cellList[i]
            let aliasColList = cell.occupy.col
            let aliasRowList = cell.occupy.row
            let startRowIndex
            let startColIndex
            let endRowIndex
            let endColIndex
            let aliasCol
            let aliasRow
            let cellIndex
            let width = 0
            let height = 0
            let physicsBox

            aliasCol = aliasColList[0]
            aliasRow = aliasRowList[0]

            cellIndex = getPointInfo(aliasCol, aliasRow, 'cellIndex')

            startRowIndex = getRowIndexByAlias(aliasRow)
            endRowIndex = startRowIndex + aliasRowList.length - 1

            if (endRowIndex > limitRowIndex) {
                endRowIndex = limitRowIndex
            }
            if (startRowIndex === -1) {
                continue
            }
            startColIndex = getColIndexByAlias(aliasCol)
            endColIndex = startColIndex + aliasColList.length - 1

            if (endColIndex > limitColIndex) {
                endColIndex = limitColIndex
            }
            if (endColIndex === -1) {
                continue
            }

            for (let j = startColIndex; j < endColIndex + 1; j++) {
                let col = cols[j]
                if (!col.hidden) {
                    width += col.width + 1
                }
            }
            for (let j = startRowIndex; j < endRowIndex + 1; j++) {
                let row = rows[j]
                if (!row.hidden) {
                    height += row.height + 1
                }
            }
            physicsBox = {
                top: rows[startRowIndex].top,
                left: cols[startColIndex].left,
                width: width - 1,
                height: height - 1
            }
            /**
             * 更新坐标信息
             */
            if (typeof cellIndex !== 'number') {
                let colAlias
                let rowAlias
                for (let j = 0; j < aliasColList.length; j++) {
                    for (let k = 0; k < aliasRowList.length; k++) {
                        colAlias = aliasColList[j]
                        rowAlias = aliasRowList[k]
                        commit(mutationTypes.UPDATE_POINTINFO, {
                            currentSheet: sheet,
                            info: {
                                colAlias,
                                rowAlias,
                                type: 'cellIndex',
                                value: cells.length
                            }
                        })
                    }
                }
                physicsBox.border = cell.border
                delete cell.border
                cell.physicsBox = physicsBox
                cell = extend({}, template, cell)
                commit(mutationTypes.INSERT_CELL, {
                    currentSheet: sheet,
                    cell
                })
            } else {
                commit(mutationTypes.UPDATE_CELL, [{
                    cell: cells[cellIndex],
                    props: {
                        physicsBox: {
                            height: physicsBox.height,
                            width: physicsBox.width
                        }
                    }
                }])
            }
        }
    },
    [actionTypes.CELLS_UPDATE]({
        commit,
        dispatch,
        getters
    }, payload) {
        let {
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex,
            propNames,
            value
        } = payload

        // 获取操作区域
        if (typeof startColIndex === 'undefined') {
            let select = getters.activeSelect
            let wholePosi = select.wholePosi

            startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
        }
        endColIndex = endColIndex || startColIndex
        endRowIndex = endRowIndex || startRowIndex

        propNames = propNames.split('.')

        let propValue
        for (let i = 0; i < propNames.length; i++) {
            let currentPropName = propNames[i]
            if (i === 0) {
                propValue = template[currentPropName]
            } else {
                propValue = propValue[currentPropName]
            }
        }
        // 获取更新值
        if (typeof value === 'undefined' && (typeof propValue === 'boolean' ||
                propValue === 0 || propValue === 1)) {
            value = getReverseValue()
        }

        let props = {}
        let temp

        for (let i = 0, len = propNames.length; i < len; i++) {
            let currentPropName = propNames[i]
            if (i === 0) {
                temp = props[currentPropName] = {}
            } else if (i < len - 1) {
                temp[currentPropName] = temp = {}
            } else {
                temp[currentPropName] = value
            }
        }

        let cols = getters.colList
        let rows = getters.rowList
        let oper = propNames[propNames.length - 1]
        let url = config.operUrl[oper]
        let data = {}

        let sendEndColIndex
        let sendEndRowIndex
        if (endColIndex === 'MAX') {
            sendEndColIndex = -1
        } else {
            sendEndColIndex = cols[endColIndex].sort
        }
        if (endRowIndex === 'MAX') {
            sendEndRowIndex = -1
        } else {
            sendEndRowIndex = rows[endRowIndex].sort
        }
        data.coordinate = []
        data.coordinate.push({
            startCol: cols[startColIndex].sort,
            startRow: rows[startRowIndex].sort,
            endCol: sendEndColIndex,
            endRow: sendEndRowIndex
        })
        if (typeof value !== 'undefined') {
            let sendPropName = config.operSendPropName[oper] || oper
            data[sendPropName] = value
        }
        send({
            url,
            data: JSON.stringify(data)
        })
        success()

        function success() {
            if (endRowIndex === 'MAX') {
                dispatch(actionTypes.COLS_OPERCOLS, {
                    startIndex: startColIndex,
                    endIndex: endColIndex,
                    props
                })
            } else if (endColIndex === 'MAX') {
                dispatch(actionTypes.ROWS_OPERROWS, {
                    startIndex: startRowIndex,
                    endIndex: endRowIndex,
                    props
                })
            } else {
                dispatch(actionTypes.CELLS_UPDATE_PROP, {
                    startColIndex,
                    endColIndex,
                    startRowIndex,
                    endRowIndex,
                    props
                })
            }
        }
        function getReverseValue() {
            let cell = getters.getCellsByVertical({
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })[0]
            let result
            if (!cell) {
                if (typeof propValue === 'boolean') {
                    result = true
                } else {
                    result = 1
                }
            }
            if (cell) {
                let temp
                for (let i = 0; i < propNames.length; i++) {
                    if (i === 0) {
                        temp = cell[propNames[i]]
                    } else {
                        temp = temp[propNames[i]]
                    }
                }
                if (typeof propValue === 'boolean') {
                    result = !temp
                } else {
                    result = 1 ^ temp
                }
            }
            return result
        }
    },
    [actionTypes.CELLS_UPDATE_PROP]({
        commit,
        dispatch,
        getters
    }, {
        startColIndex,
        endColIndex,
        startRowIndex,
        endRowIndex,
        props,
        fn
    }) {
        let getPointInfo = getters.getPointInfo
        let tempSign = {}
        let cols = getters.colList
        let rows = getters.rowList
        let cells = getters.cellList
        let updateCellInfo = []
        let insertCellList = []
        let colAlias
        let rowAlias
        let cellIndex

        for (let i = startColIndex; i <= endColIndex; i++) {
            for (let j = startRowIndex; j <= endRowIndex; j++) {
                colAlias = cols[i].alias
                rowAlias = rows[j].alias
                cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex')
                if (typeof cellIndex === 'number') {
                    let cell
                    if ((cell = cells[cellIndex]) && !tempSign[cell.alias]) {
                        let updateProp
                        if (fn) {
                            updateProp = extend({}, props, fn(cell))
                        } else {
                            updateProp = props
                        }
                        updateCellInfo.push({
                            cell,
                            props: updateProp
                        })
                    }
                } else {
                    let cell = extend({
                        occupy: {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                    }, props)
                    insertCellList.push(cell)
                }
            }
        }

        dispatch(actionTypes.CELLS_INSERTCELL, insertCellList)
        if (updateCellInfo.length > 0) {
            commit(mutationTypes.UPDATE_CELL, updateCellInfo)
        }
    },
    [actionTypes.CELLS_UPDATE_BORDER]({
        commit,
        dispatch,
        getters
    }, payload) {
        let {
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex,
            value
        } = payload

        if (typeof startColIndex === 'undefined') {
            let select = getters.activeSelect
            let wholePosi = select.wholePosi
            startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
        }
        let thick = false
        if (value.indexOf('-thick') !== -1) {
            thick = true
            value = value.split('-')[0]
        }

        let operates = []

        switch (value) {
            case 'bottom':
                setBottom()
                break
            case 'top':
                setTop()
                break
            case 'left':
                setLeft()
                break
            case 'right':
                setRight()
                break
            case 'none':
                setNone()
                break
            case 'all':
                setAll()
                break
            case 'outer':
                setOuter()
                break
        }


        function setBottom() {
            if (endRowIndex !== 'MAX') {
                operates.push({
                    startRowIndex: endRowIndex,
                    startColIndex,
                    endRowIndex,
                    endColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                bottom: thick ? 2 : 1
                            }
                        }
                    }
                })
            }
        }

        function setTop() {
            operates.push({
                startRowIndex,
                startColIndex,
                endRowIndex: startRowIndex,
                endColIndex,
                props: {
                    physicsBox: {
                        border: {
                            top: thick ? 2 : 1
                        }
                    }
                }
            })
        }

        function setLeft() {
            operates.push({
                startRowIndex,
                startColIndex,
                endRowIndex,
                endColIndex: startColIndex,
                props: {
                    physicsBox: {
                        border: {
                            left: thick ? 2 : 1
                        }
                    }
                }
            })
        }

        function setRight() {
            if (endColIndex !== 'MAX') {
                operates.push({
                    startRowIndex,
                    startColIndex: endColIndex,
                    endRowIndex,
                    endColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                right: thick ? 2 : 1
                            }
                        }
                    }
                })
            }
        }

        function setNone() {
            operates.push({
                startRowIndex,
                startColIndex,
                endRowIndex,
                endColIndex,
                props: {
                    physicsBox: {
                        border: {
                            right: 0,
                            left: 0,
                            top: 0,
                            bottom: 0
                        }
                    }
                }
            })
        }

        function setAll() {
            operates.push({
                startRowIndex,
                startColIndex,
                endRowIndex,
                endColIndex,
                props: {
                    physicsBox: {
                        border: {
                            right: 1,
                            left: 1,
                            top: 1,
                            bottom: 1
                        }
                    }
                }
            })
        }

        function setOuter() {
            if (endRowIndex !== 'MAX') {
                operates.push({
                    startRowIndex: endRowIndex,
                    startColIndex,
                    endRowIndex,
                    endColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                bottom: thick ? 2 : 1
                            }
                        }
                    }
                })
                operates.push({
                    startRowIndex,
                    startColIndex,
                    endRowIndex: startRowIndex,
                    endColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                top: thick ? 2 : 1
                            }
                        }
                    }
                })
            }

            if (endColIndex !== 'MAX') {
                operates.push({
                    startRowIndex,
                    startColIndex: endColIndex,
                    endRowIndex,
                    endColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                right: thick ? 2 : 1
                            }
                        }
                    }
                })
                operates.push({
                    startRowIndex,
                    startColIndex,
                    endRowIndex,
                    endColIndex: startColIndex,
                    props: {
                        physicsBox: {
                            border: {
                                left: thick ? 2 : 1
                            }
                        }
                    }
                })
            }
        }
        let url = config.operUrl.border
        let cols = getters.colList
        let rows = getters.rowList
        let data

        data = {
            coordinate: [{
                startCol: cols[startColIndex].sort,
                startRow: rows[startRowIndex].sort,
                endCol: endColIndex === 'MAX' ? -1 : cols[endColIndex].sort,
                endRow: endRowIndex === 'MAX' ? -1 : rows[endRowIndex].sort
            }],
            direction: value
        }
        if (value !== 'none') {
            data.line = thick ? 2 : 1
        }
        send({
            url,
            data: JSON.stringify(data),
        })
        success()

        function success() {
            if (endRowIndex === 'MAX') {
                operates.forEach((item) => {
                    dispatch(actionTypes.COLS_OPERCOLS, {
                        startIndex: item.startColIndex,
                        endIndex: item.endColIndex,
                        props: item.props
                    })
                })
            } else if (endColIndex === 'MAX') {
                operates.forEach((item) => {
                    dispatch(actionTypes.ROWS_OPERROWS, {
                        startIndex: item.startRowIndex,
                        endIndex: item.endRowIndex,
                        props: item.props
                    })
                })
            } else {
                operates.forEach((item) => {
                    dispatch(actionTypes.CELLS_UPDATE_PROP, item)
                })
            }
        }
    },
    /**
     * 插入单元格
     * 传入单元初始化属性和占位
     * 计算出单元格的盒模型，同时维护pointsinfo
     */
    [actionTypes.CELLS_INSERTCELL]({
        commit,
        state,
        rootState,
        getters
    }, cellList) {
        let cols = getters.colList
        let rows = getters.rowList
        let indexCounter = getters.cellList.length
        cellList.forEach(function(item) {
            let cell = item
            let aliasColList = cell.occupy.col
            let aliasRowList = cell.occupy.row
            let startRowIndex
            let startColIndex
            let endColIndex
            let endRowIndex

            cell = extend({}, template, cell)

            startColIndex = getters.getColIndexByAlias(aliasColList[0])
            endColIndex = getters.getColIndexByAlias(aliasColList[aliasColList.length - 1])
            startRowIndex = getters.getRowIndexByAlias(aliasRowList[0])
            endRowIndex = getters.getRowIndexByAlias(aliasRowList[aliasRowList.length - 1])

            let top = rows[startRowIndex].top
            let left = cols[startColIndex].left
            let width
            let height

            for (let i = endColIndex; i > startColIndex - 1; i--) {
                if (cols[i].hidden) {
                    continue
                } else {
                    width = cols[i].left + cols[i].width - cols[startColIndex].left
                    break
                }
            }
            width = width || -1

            for (let i = endRowIndex; i > startRowIndex - 1; i--) {
                if (rows[i].hidden) {
                    continue
                } else {
                    height = rows[i].top + rows[i].height - rows[startRowIndex].top
                    break
                }
            }
            height = height || -1

            let physicsBox = {
                top,
                left,
                width,
                height
            }

            extend(cell, {
                physicsBox
            })

            cell.alias = generator.cellAliasGenerator()
            commit(mutationTypes.INSERT_CELL, {
                currentSheet: rootState.currentSheet,
                cell
            })
            for (let j = 0; j < aliasColList.length; j++) {
                for (let k = 0; k < aliasRowList.length; k++) {
                    let colAlias = aliasColList[j]
                    let rowAlias = aliasRowList[k]

                    commit(mutationTypes.UPDATE_POINTINFO, {
                        currentSheet: rootState.currentSheet,
                        info: {
                            colAlias,
                            rowAlias,
                            type: 'cellIndex',
                            value: indexCounter
                        }
                    })
                }
            }
            indexCounter++
        })
    },
    [actionTypes.COLS_OPERCOLS]({
        getters,
        state,
        rootState,
        commit,
        dispatch
    }, {
        startIndex,
        endIndex,
        props,
        fn
    }) {
        let updateCellInfo = []
        let cellList = getters.getCellsByVertical({
            startRowIndex: 0,
            endRowIndex: 'MAX',
            startColIndex: startIndex,
            endColIndex: endIndex
        })
        cellList.forEach(function(cell) {
            let updateProp
            if (fn) {
                updateProp = extend({}, props, fn(cell))
            } else {
                updateProp = props
            }
            updateCellInfo.push({
                cell,
                updateProp
            })
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let insertCellInfo = []
        let editViewOccupy = getters.getEditViewOccupy()
        let cols = getters.colList
        let rows = getters.rowList

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let viewOccupyRow = editViewOccupy[key].row
                let startRowIndex
                let endRowIndex
                if (viewOccupyRow.length === 0) {
                    continue
                }
                startRowIndex = getters.getRowIndexByAlias(viewOccupyRow[0])
                endRowIndex = getters.getRowIndexByAlias(viewOccupyRow[viewOccupyRow.length - 1])

                for (let i = startRowIndex; i < endRowIndex + 1; i++) {
                    for (let j = startIndex; j < endIndex + 1; j++) {
                        let colAlias = cols[j].alias
                        let rowAlias = rows[i].alias
                        let cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex')
                        if (typeof cellIndex !== 'number') {
                            let cell = extend({}, props)
                            cell.occupy = {
                                col: [colAlias],
                                row: [rowAlias]
                            }
                            insertCellInfo.push(cell)
                        }
                    }
                }
            }
        }
        dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo)
    },
    [actionTypes.ROWS_OPERROWS]({
        getters,
        state,
        rootState,
        commit,
        dispatch
    }, {
        startIndex,
        endIndex,
        props,
        fn
    }) {
        let updateCellInfo = []

        let cellList = getters.getCellsByVertical({
            startRowIndex: startIndex,
            endRowIndex: endIndex,
            startColIndex: 0,
            endColIndex: 'MAX'
        })
        cellList.forEach(function(cell) {
            let updateProp
            if (fn) {
                updateProp = extend({}, props, fn(cell))
            } else {
                updateProp = props
            }
            updateCellInfo.push({
                cell,
                updateProp
            })
        })
        commit(mutationTypes.UPDATE_CELL, updateCellInfo)

        let insertCellInfo = []
        let editViewOccupy = getters.getEditViewOccupy()
        let cols = getters.colList
        let rows = getters.rowList

        for (let key in editViewOccupy) {
            if (Object.prototype.hasOwnProperty.call(editViewOccupy, key)) {
                let viewOccupyCol = editViewOccupy[key].col
                let startColIndex
                let endColIndex

                if (viewOccupyCol.length === 0) {
                    continue
                }
                startColIndex = getters.getColIndexByAlias(viewOccupyCol[0])
                endColIndex = getters.getColIndexByAlias(viewOccupyCol[viewOccupyCol.length - 1])

                for (let i = startColIndex; i < endColIndex + 1; i++) {
                    for (let j = startIndex; j < endIndex + 1; j++) {
                        let colAlias = cols[i].alias
                        let rowAlias = rows[j].alias
                        let cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex')
                        let cell = extend({}, props)

                        cell.occupy = {
                            col: [colAlias],
                            row: [rowAlias]
                        }
                        if (typeof cellIndex !== 'number') {
                            insertCellInfo.push(cell)
                        }
                    }
                }
            }
        }
        dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo)
    },
    [actionTypes.OCCUPY_UPDATE]({
        commit,
        getters,
        rootState,
        dispatch
    }, {
        col,
        row
    }) {
        if (col.length === 0 || row.length === 0) {
            return
        }
        let startRowIndex = getters.getRowIndexByAlias(row[0])
        let startColIndex = getters.getColIndexByAlias(col[0])
        let endRowIndex = getters.getRowIndexByAlias(row[row.length - 1])
        let endColIndex = getters.getColIndexByAlias(col[col.length - 1])
        let cols = getters.colList
        let rows = getters.rowList
        let getPointInfo = getters.getPointInfo
        let temp

        for (let i = startRowIndex; i < endRowIndex + 1; i++) {
            if (!isEmpty(temp = rows[i].oprProp)) {
                for (let j = startColIndex; j < endColIndex + 1; j++) {
                    let rowAlias = rows[i].alias
                    let colAlias = cols[j].alias
                    let index = getPointInfo(colAlias, rowAlias, 'cellIndex')
                    let cell = extend({}, temp)

                    cell.occupy = {
                        col: [colAlias],
                        row: [rowAlias]
                    }
                    if (typeof index !== 'number') {
                        dispatch(actionTypes.CELLS_INSERTCELL, [cell])
                    }
                }
            }
        }


        for (let i = startColIndex; i < endColIndex + 1; i++) {
            if (!isEmpty(temp = cols[i].oprProp)) {
                for (let j = startRowIndex; j < endRowIndex + 1; j++) {
                    let rowAlias = rows[j].alias
                    let colAlias = cols[i].alias
                    let index = getPointInfo(colAlias, rowAlias, 'cellIndex')
                    let cell = extend({}, temp)

                    cell.occupy = {
                        col: [colAlias],
                        row: [rowAlias]
                    }
                    if (typeof index !== 'number') {
                        dispatch(actionTypes.CELLS_INSERTCELL, [cell])
                    }
                }
            }
        }

        function isEmpty(obj) {
            let content = obj.content
            if (content) {
                for (let key in content) {
                    if (Object.prototype.hasOwnProperty.call(content, key)) {
                        return false
                    }
                }
            }
            let border = obj.border
            if (border) {
                for (let key in border) {
                    if (Object.prototype.hasOwnProperty.call(border, key)) {
                        return false
                    }
                }
            }
            let customProp = obj.customProp
            if (customProp) {
                for (let key in customProp) {
                    if (Object.prototype.hasOwnProperty.call(customProp, key)) {
                        return false
                    }
                }

            }
            return true
        }
    },
    [actionTypes.CELLS_HANDLEMERGE]({
        dispatch,
        getters,
        rootState
    }, payload) {
        let {
            startColIndex,
            startRowIndex,
            endRowIndex,
            endColIndex,
            value
        } = payload || {}

        if (typeof startColIndex === 'undefined') {
            let select = getters.activeSelect
            let wholePosi = select.wholePosi

            startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias)
            endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias)
            startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias)
            endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias)
        }
        endColIndex = endColIndex || startColIndex
        endRowIndex = endRowIndex || startRowIndex
        if (endRowIndex === 'MAX' || endColIndex === 'MAX') {
            return
        }

        if (typeof value === 'undefined') {
            value = !getters.getMergeState()
        }
        let action = value ? 'merge' : 'split'
        let url = config.operUrl[action]
        let cols = getters.colList
        let rows = getters.rowList
        let data

        data = {
            coordinate: [{
                startCol: cols[startColIndex].sort,
                startRow: rows[startRowIndex].sort,
                endCol: endColIndex === 'MAX' ? -1 : cols[endColIndex].sort,
                endRow: endRowIndex === 'MAX' ? -1 : rows[endRowIndex].sort
            }]
        }
        send({
            url,
            data: JSON.stringify(data)
        })

        if (value) {
            dispatch(actionTypes.CELLS_MERGE, {
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        } else {
            dispatch(actionTypes.CELLS_SPLIT, {
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        }
    },
    [actionTypes.CELLS_MERGE]({
        dispatch,
        getters
    }, {
        startColIndex,
        endColIndex,
        startRowIndex,
        endRowIndex
    }) {
        let cellList = getters.getCellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })
        let cell
        for (let i = 0, len = cellList.length; i < len; i++) {
            if (cellList[i].content.texts) {
                cell = cellList[i]
                break
            }
        }
        if (!cell) {
            cell = getters.getCellsByTransverse({
                startColIndex,
                startRowIndex
            })[0]
        }
        cell = extend({}, cell || {})

        let cols = getters.colList
        let rows = getters.rowList
        let rowAliasList = []
        let colAliasList = []

        for (let i = startColIndex; i < endColIndex + 1; i++) {
            colAliasList.push(cols[i].alias)
        }
        for (let i = startRowIndex; i < endRowIndex + 1; i++) {
            rowAliasList.push(rows[i].alias)
        }

        cell.occupy = {
            row: rowAliasList,
            col: colAliasList
        }
        dispatch(actionTypes.CELLS_INSERTCELL, [cell])
    },
    [actionTypes.CELLS_SPLIT]({
        rootState,
        dispatch,
        getters,
        commit
    }, {
        startColIndex,
        endColIndex,
        startRowIndex,
        endRowIndex
    }) {
        let cellList = getters.getCellsByTransverse({
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        })

        let insertCellList = []

        cellList.forEach(cell => {
            let occupyCol = cell.occupy.col
            let occupyRow = cell.occupy.row
            if (occupyRow.length > 1 || occupyCol.length > 1) {
                for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
                    for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
                        let insertCell = extend(cell)
                        if (i !== 0 || j !== 0) {
                            insertCell.content.texts = ''
                        }
                        insertCell.occupy = {
                            col: [occupyCol[i]],
                            row: [occupyRow[j]]
                        }
                        insertCellList.push(insertCell)
                    }
                }
            }
        })
        dispatch(actionTypes.CELLS_INSERTCELL, insertCellList)
    },
    [actionTypes.CELLS_FORMAT]({
        commit,
        getters,
        rootState,
    }, reg) {
        function splitReg(str) {
            let localStr = str
            let keyRegs = [{
                reg: /0^\.|0\.0{1,3}/g,
                match: true,
                handle: 'decimal'
            }, {
                reg: /#,##/g,
                decorate: 'middle'
            }, {
                reg: /%/g,
                match: true,
                decorate: 'after',
                handle: 'percent'
            }, {
                reg: /\$|￥/g,
                match: true,
                decorate: 'before',
            }, {
                reg: /^@$/g,
                handle: 'article'
            }, {
                reg: /^G$/g,
                handle: 'examine'
            }, {
                reg: /^(y{4})[-/年]?(m{1,2})[-/月]?(d{1,2})[日]?$|^(y{4})[-/年]?(m{1,2})[-/月]?/g,
                handle: 'whole',
                match: true
            }]
            let retRegs = []
            for (let i = 0, len = keyRegs.length; i < len; i++) {
                let item = keyRegs[i]
                let reg = item['reg']
                let ret = reg.exec(localStr)
                if (ret) {
                    if (item.match) {
                        item.match = ret[0]
                    }
                    retRegs.push(item)
                    let arrayStr = localStr.split('')
                    arrayStr.splice(ret.index, reg.lastIndex - ret.index)
                    localStr = arrayStr.join('')
                    if (!localStr.length) {
                        break
                    }
                }
            }
            return retRegs
        }
        let Complier = function(inptVal, type = '') {
            this.origin = this.manifest = this.inpt = inptVal
            this.dateType = type
        }
        Complier.prototype = {
            initilize: function(rules) {
                let calculate = function(handleType) {
                    for (let i = 0, len = rules.length; i < len; i++) {
                        let item = rules[i]
                        let handleName
                        if ((handleName = item[handleType]) != null) {
                            this.manifest = this[handleName](item)
                        }
                    }
                }.bind(this)

                calculate('handle')
                calculate('decorate')
            },
            /**
             * [返回数字类型]
             * @param  {[type]} rule [description]
             * @return {[number]}      [description]
             */
            decimal: function(rule) {
                // 小数变整数，四舍五入
                // 整数变小数
                // 小数变小数，四舍五入
                let exps = rule.match
                if (exps.indexOf('.') !== -1) {
                    let figure = exps.length - exps.indexOf('.') - 1
                    return this.origin.toFixed(figure)
                }
                return parseInt(this.origin, 10)
            },
            percent: function(rule) {
                return this.origin * 100
            },
            article: function() {
                return this.origin.toString()
            },
            examine: function() {
                let type = 'text'
                let localValue
                if (!isNaN(localValue = parseFloat(this.origin)) &&
                    typeof localValue === 'number') {
                    type = 'number'
                }
                if (!isNaN(Date.parse(this.origin))) {
                    type = 'date'
                }
                return type
            },
            /**
             * [修饰符在中间，需要number类型]
             * @return {[String]} [description]
             */
            middle: function() {
                return this.origin.toLocaleString()
            },
            /**
             * [修饰符在前面]
             * @param  {[type]} rule [description]
             * @return {[String]}      [description]
             */
            before: function(rule) {
                return rule.match + this.manifest
            },
            /**
             * [修饰符在后面, 但要计算数据值]
             * @param  {[type]} rule [description]
             * @return {[String]}      [description]
             */
            after: function(rule) {
                return this.manifest + rule.match
            },
            whole: function(rule) {
                let localDate = new Date(this.origin)
                let dateMap = {
                    y: localDate.getFullYear(),
                    m: localDate.getMonth() + 1,
                    d: localDate.getDate()
                }
                let ret = rule.match.replace(/([ymd]+)/g, function(
                    match, name) {
                    let localName = name.substring(0, 1)
                    return (dateMap[localName] != null) ?
                        dateMap[localName] : ''
                })
                console.log(ret)
            }
        }
        // let rules = splitReg(reg)
        splitReg(reg)
        // getters.getSelectCell()
        // var ec = new Complier(originalValue)
        // ec.initilize(rules)
    }
}