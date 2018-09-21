import extend from '../../../util/extend'
import * as actionTypes from '../../action-types'
import {
    INSERT_SHEET,
} from '../../mutation-types'
import template from './template'
import send from '../../../util/send'
import config from '../../../config'
export default {
    /**
     * 还原sheet
     */
    [actionTypes.SHEET_INSERT]({
        commit,
        getters,
        state,
        rootState
    }, sheet) {
        let fixedSheet = {
            alias: sheet.alias,
            name: sheet.name,
            frozen: {}
        }
        if (sheet.frozen && sheet.frozen.colAlias) {
            let cols = rootState.cols.list
            let first = cols[0].alias
            let last = cols[cols.length - 1].alias
            let neighbor = getters.neighborColByAlias(sheet.frozen.colAlias,
                'NEXT')
            if (neighbor == null) {
                throw new Error('frozen position error from col')
            }
            fixedSheet.frozen.col = [{
                start: first,
                over: sheet.frozen.colAlias
            }, {
                start: neighbor.alias,
                over: last
            }]
            let alias = fixedSheet.frozen.alias
            if (alias == null) {
                fixedSheet.frozen.alias = {}
            }
            fixedSheet.frozen.alias.col = sheet.frozen.colAlias
        }
        if (sheet.frozen && sheet.frozen.rowAlias) {
            let rows = rootState.rows.list
            let first = rows[0].alias
            let last = rows[rows.length - 1].alias
            let neighbor = getters.neighborRowByAlias(sheet.frozen.rowAlias,
                'NEXT')
            if (neighbor == null) {
                throw new Error('frozen position error from row')
            }
            fixedSheet.frozen.row = [{
                start: first,
                over: sheet.frozen.rowAlias
            }, {
                start: neighbor.alias,
                over: last
            }]
            let alias = fixedSheet.frozen.alias
            if (alias == null) {
                fixedSheet.frozen.alias = {}
            }
            fixedSheet.frozen.alias.row = sheet.frozen.rowAlias
        }
        commit(INSERT_SHEET, extend(template, fixedSheet))
    },
    A_SHEETS_FROZEN({
        state,
        getters,
        rootState,
        dispatch
    }, type) {
        let select = getters.selectByType('SELECT')
        send({
            url: config.url.frozen,
            body: JSON.stringify({
                viewRow: 0,
                viewCol: 0,
                oprCol: select.signalSort.startCol,
                oprRow: select.signalSort.startRow
            })
        }).then(function(data) {
            // console.log(data)
            // window.location.reload()
        })
    },
    A_SHEETS_UNFROZEN({
        dispatch
    }) {
        send({
            url: config.url.unfrozen
        }).then(function(data) {
            // console.log(data)
            // window.location.reload()
        })
    },
    /**
     * [SHEET_SCROLL_DOWN 滚动视图]
     * @param {[number]} options.limit       [当前方向的触发值]
     * @param {[object]} options.viewLoaded  [当前视图的Map]
     */
    SHEET_SCROLL_VERTICAL({
        state,
        dispatch,
        commit,
        rootGetters
    }, {
        limitMin,
        limitMax,
        viewLoaded
    }) {
        // 所有视图， 记录对象
        let allLoaded = rootGetters['loaded']
        let max = rootGetters['max']

        // 当前视图，记录点，行、列长度
        let rowLen = viewLoaded.rows.length
        let colLen = viewLoaded.cols.length

        // 当前视图，数组，行，第一个元素
        let firstRowAlias = viewLoaded.rows[0]
        let firstRow = rootGetters.getRowByAlias(firstRowAlias)
        let firstRowIndex = rootGetters.rowIndexByAlias(firstRowAlias)
        let firstRowDistance = firstRow.top + firstRow.height

        // 当前视图，数组， 列， 第一个元素
        let firstColAlias = viewLoaded.cols[0]
        let firstCol = rootGetters.getColByAlias(firstColAlias)
        let firstColIndex = rootGetters.colIndexByAlias(firstColAlias)

        // 当前视图，数组，行， 最后一个元素
        let lastRowAlias = viewLoaded.rows[rowLen - 1]
        let lastRow = rootGetters.getRowByAlias(lastRowAlias)
        let lastRowIndex = rootGetters.rowIndexByAlias(lastRowAlias)
        let lastRowDistance = lastRow != null ?
            lastRow.top + lastRow.height : 0

        // 当前视图， 数组， 列， 最后一个元素
        let lastColAlias = viewLoaded.cols[colLen - 1]
        let lastCol = rootGetters.getColByAlias(lastColAlias)
        let lastColIndex = rootGetters.colIndexByAlias(lastColAlias)

        // 当前视图， map，行 ， 第一个元素
        // 行上面的第二个元素
        let cordRowAlias = viewLoaded.rows[1]
        let cordRow = rootGetters.getRowByAlias(cordRowAlias)
        let cordRowIndex = rootGetters.rowIndexByAlias(cordRowAlias)
        let cordRowDistance = cordRow.top + cordRow.height

        // 如果loaded区域已经占用多多余一个记录点
        // 就需要判断是否回收冗余DOM
        // 在一个方向上，最多占用两个记录点
        // ------------------
        // 如果可以保证每次加载的高度大于用户limit高度，就可以改为2
        if (rowLen > 2) {
            // 滚动方向： DOWN
            // 判断当前视图的触发点是否大于当前视图的第一个map点
            //   1. 如果大于，向下滚动时，清除上的DOM
            // 判断是否触发
            if (limitMin > cordRowDistance) {
                // 从map中查找记录点，删除记录点
                // 记录最大的列值，
                // 划定范围
                let cells = rootGetters.cellsByVertical({
                    startColIndex: firstColIndex,
                    endColIndex: lastColIndex,
                    startRowIndex: firstRowIndex,
                    endRowIndex: cordRowIndex
                })
                if (cells.length !== 0) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: false
                    })
                }
                commit('M_ROWS_UPDATE_VIEW', {
                    isView: false,
                    startIdx: firstRowIndex,
                    overIdx: cordRowIndex
                })
                delView({
                    alias: cordRowAlias
                })
            }
            // 滚动方向： UP
            // 向上滚动时，判断视图底部的触发值
            // 是否小于cord坐标的top
            //   1. 如果小于cord坐标，就清除下面的map和DOM结构
            if (limitMax < cordRow.top) {
                let cells = rootGetters.cellsByVertical({
                    startColIndex: firstColIndex,
                    endColIndex: lastColIndex,
                    startRowIndex: cordRowIndex,
                    endRowIndex: lastRowIndex
                })
                if (cells.length !== 0) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: false
                    })
                }
                commit('M_ROWS_UPDATE_VIEW', {
                    isView: false,
                    startIdx: cordRowIndex,
                    overIdx: lastRowIndex
                })
                delView({
                    alias: lastRowAlias,
                    final: true
                })
            }
        }
        // 判断方向： UP
        // 滚动时，上面加载被隐藏的DOM结构
        // 没有考虑向上滚动时，没有数据的情况
        // 基于目前的功能，不存在这种情况
        if (limitMin < firstRowDistance) {
            let loadedIdx = rootGetters.loadedIdxByAlias({
                alias: firstRowAlias,
                type: 'ROWS'
            })
            let isFrozen = rootGetters.isFrozen()
            let frozenAlias = rootGetters.frozenAlias()
            let frozenAliasRow = frozenAlias.row

            // 冻结情况下，DOM的加载位置上限是冻结位置
            if (isFrozen && frozenAliasRow != null) {
                let neighborRow = rootGetters.neighborRowByAlias(frozenAliasRow,
                    'NEXT')
                if (firstRowAlias === neighborRow.alias) {
                    loadedIdx = -1
                }
            }
            if (loadedIdx !== 0 && loadedIdx !== -1) {
                let preRow = allLoaded.rows[loadedIdx - 1]
                let preRowIdx = rootGetters.rowIndexByAlias(preRow)
                commit('M_ROWS_UPDATE_VIEW', {
                    isView: true,
                    startIdx: preRowIdx,
                    overIdx: firstRowIndex
                })
                let cells = rootGetters.cellsByVertical({
                    startRowIndex: preRowIdx,
                    endRowIndex: firstRowIndex,
                    startColIndex: firstColIndex,
                    endColIndex: lastColIndex
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: true
                    })
                }
                insertView({
                    firstAlias: firstRowAlias,
                    neighborAlias: preRow
                })
            }
        }
        // 判断滚动的距离是否需要触发加载行为
        // 1. 不需要就什么都不做
        // 2. 需要的话，
        //  2.1. 当前记录点，所在的索引是否是最后一个，
        //   2.1.1. 如果是，就把最后一个对象的高端 + preHeight，作为请求的上下范围
        //   2.1.2. 如果不是，把下一个索引和这个索引之间的所有对象，row，col，cell全部
        //          置成show模式
        // 滚动方向： 向下
        if (limitMax > lastRowDistance) {

            // 有这个记录点，并且这个记录点不是在最后一个位置，说明不需要请求后台
            let allColMap = allLoaded.rowMap.get(lastRowAlias)
            let needRequire = allColMap != null &&
                allColMap.get(lastColAlias) &&
                allLoaded.rows.length - lastRowIndex > 1 ? false : true
            if (needRequire) {

                // 考虑到行、列都会有一个边框，所以需要在每个元素上 +1
                // 如果显示的结束行距离大于表格的最大行数，
                // 就需要改为增加行请求，不然就是请求行
                lastRowDistance += 1
                return lastRowDistance >= max.rowPixel ?
                    expand() : require()
            } else {
                let loadedIdx = rootGetters.loadedIdxByAlias({
                    alias: lastRowAlias,
                    type: 'ROWS'
                })
                let nextRow = allLoaded.rows[loadedIdx + 1]
                let nextRowIdx = rootGetters.rowIndexByAlias(nextRow)
                commit('M_ROWS_UPDATE_VIEW', {
                    isView: true,
                    startIdx: lastRowIndex,
                    overIdx: nextRowIdx
                })
                let cells = rootGetters.cellsByVertical({
                    startRowIndex: lastRowIndex,
                    endRowIndex: nextRowIdx,
                    startColIndex: firstColIndex,
                    endColIndex: lastColIndex
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: true
                    })
                }
                addView(nextRow)
            }
        }
        // ---------------
        // 由于涉及到传入的viewload参数修改问题
        // 理应放到回到函数中处理，但是涉及的内容跟
        // 业务结合紧密且不会立即返回，所以
        // 暂时用内部函数代替
        // ---------------
        /**
         * 增加行
         * @return {[type]} [description]
         */
        function expand() {
            let num = config.prestrainHeight / (config.rowHeight + 1)
            send({
                url: config.url.createLine,
                body: JSON.stringify({
                    type: 'row',
                    num
                })
            }).then(() => {
                let last = lastRow()
                for (let i = 0; i < num; i++) {
                    dispatch(actionTypes.ROWS_ADD, [{
                        sort: last.sort + i + 1,
                        top: last.top + last.height + 1 +
                            config.rowHeight * i
                    }])
                    if (i === num - 1) {
                        last = lastRow()
                        addView(last.alias)
                    }
                }

                function lastRow() {
                    let rows = rootGetters.allRows
                    return rows[rows.length - 1]
                }
            })
        }
        /**
         * 请求数据从已经存在的数据表中
         * @return {[type]} [description]
         */
        function require() {
            let bottom = Math.min(lastRowDistance + config.prestrainHeight, max
                .rowPixel)
            return send({
                url: config.url.area,
                body: JSON.stringify({
                    top: lastRowDistance + 1,
                    bottom,
                    left: firstCol.left + 1,
                    right: lastCol.left + lastCol.width
                })
            }, false).then(function(data) {
                let rows = data.gridLineRow
                if (rootGetters.getRowByAlias(rows[0].alias) == null) {
                    dispatch(actionTypes.ROWS_ADD, rows)
                    commit('M_SHEETS_UPDATE_FROZEN', {
                        type: 'ROW',
                        value: rows[rows.length - 1].alias
                    })
                }
                if (data.cells.length !== 0) {
                    dispatch(actionTypes.A_CELLS_ADD, data.cells)
                }
                let backRowAlias = rows[rows.length - 1].alias
                commit('M_SHEETS_ADD_LOADED', {
                    rowAlias: backRowAlias,
                    colAlias: lastCol.alias
                })
                addView(backRowAlias)
            })
        }
        /**
         * 添加map信息，最后面
         * @param {[type]} alias [description]
         */
        function addView(alias) {
            for (let i = 1; i < colLen; i++) {
                let item = viewLoaded.cols[i]
                viewLoaded.rowMap.set(alias,
                    new Map().set(item, true))
                viewLoaded.colMap.get(item)
                    .set(alias, true)
            }
            viewLoaded.rows.push(alias)
        }
        /**
         * 在最前面插入map信息
         * @param  {[type]} options.firstAlias    [description]
         * @param  {[type]} options.neighborAlias [description]
         * @return {[type]}                       [description]
         */
        function insertView({
            firstAlias,
            neighborAlias
        }) {
            let rowItem = new Map()
            let colMap = viewLoaded.colMap
            viewLoaded.rowMap.set(firstAlias, rowItem)

            // 因为map中，需要过滤掉左上角的坐标
            // 所以，i = 0是，不计入map里
            for (let i = 1; i < colLen; i++) {
                let item = viewLoaded.cols[i]
                rowItem.set(item, true)
                colMap.get(item).set(firstAlias, true)
            }
            viewLoaded.rows.splice(0, 0, neighborAlias)
        }
        /**
         * 删除map信息
         * @param  {[boolean]} final [是否在最后删除]
         * @return {[type]}       [description]
         */
        function delView({
            alias,
            final = false
        }) {
            let rowMap = viewLoaded.rowMap
            let colMap = viewLoaded.colMap
            rowMap.forEach((rowValue, rowKey) => {
                if (rowKey === alias) {
                    rowValue.forEach((colValue, colKey) => {
                        colMap.get(colKey).delete(rowKey)
                    })
                    return
                }
            })
            rowMap.delete(alias)
            let rows = viewLoaded.rows
            if (final) {
                rows.splice(rows.length - 1, 1)
            } else {
                rows.splice(0, 1)
            }
        }
        // this.scrollToBottom({
        //     limitTop,
        //     limitBottom
        // }).then(function() {
        // this.$store.commit(mutationTypes.UPDATE_USERVIEW, {
        //     top: this.recordScrollTop + this.offsetTop,
        //     bottom: limitBottom
        // })
        // })
        console.log(viewLoaded.rows)
        console.log(viewLoaded.rowMap)
        console.log(allLoaded)
    },
    SHEET_SCROLL_TRANSVERSE({
        state,
        dispatch,
        commit,
        rootGetters
    }, {
        limitMin,
        limitMax,
        viewLoaded
    }) {
        // 所有视图， 记录对象
        let allLoaded = rootGetters['loaded']
        let max = rootGetters['max']

        // 当前视图，记录点，行、列长度
        let rowLen = viewLoaded.rows.length
        let colLen = viewLoaded.cols.length

        // 当前视图，数组，行，第一个元素
        let firstRowAlias = viewLoaded.rows[0]
        let firstRow = rootGetters.getRowByAlias(firstRowAlias)
        let firstRowIndex = rootGetters.rowIndexByAlias(firstRowAlias)

        // 当前视图，数组， 列， 第一个元素
        let firstColAlias = viewLoaded.cols[0]
        let firstCol = rootGetters.getColByAlias(firstColAlias)
        let firstColIndex = rootGetters.colIndexByAlias(firstColAlias)
        let firstColDistance = firstCol.left + firstCol.width

        // 当前视图，数组，行， 最后一个元素
        let lastRowAlias = viewLoaded.rows[rowLen - 1]
        let lastRow = rootGetters.getRowByAlias(lastRowAlias)
        let lastRowIndex = rootGetters.rowIndexByAlias(lastRowAlias)

        // 当前视图， 数组， 列， 最后一个元素
        let lastColAlias = viewLoaded.cols[colLen - 1]
        let lastCol = rootGetters.getColByAlias(lastColAlias)
        let lastColIndex = rootGetters.colIndexByAlias(lastColAlias)
        let lastColDistance = lastCol.left + lastCol.width

        // 当前视图， map，列 ， 第一个元素
        // 列上面的第二个元素
        let cordColAlias = viewLoaded.cols[1]
        let cordCol = rootGetters.getColByAlias(cordColAlias)
        let cordColIndex = rootGetters.colIndexByAlias(cordColAlias)
        let cordColDistance = cordCol.left + cordCol.width

        // 如果loaded区域已经占用多多余一个记录点
        // 就需要判断是否回收冗余DOM
        // 在一个方向上，最多占用两个记录点
        // ------------------
        // 如果可以保证每次加载的高度大于用户limit高度，就可以改为2
        if (colLen > 2) {
            // 滚动方向： DOWN
            // 判断当前视图的触发点是否大于当前视图的第一个map点
            //   1. 如果大于，向下滚动时，清除上的DOM
            // 判断是否触发
            if (limitMin > cordColDistance) {
                // 从map中查找记录点，删除记录点
                // 记录最大的列值，
                // 划定范围
                let cells = rootGetters.cellsByVertical({
                    startColIndex: firstColIndex,
                    endColIndex: cordColIndex,
                    startRowIndex: firstRowIndex,
                    endRowIndex: lastRowIndex
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: false
                    })
                }
                commit('M_COLS_UPDATE_VIEW', {
                    isView: false,
                    startIdx: firstColIndex,
                    overIdx: cordColIndex
                })
                delView({
                    alias: cordColAlias
                })
            }
            // 滚动方向： UP
            // 向上滚动时，判断视图底部的触发值
            // 是否小于cord坐标的top
            //   1. 如果小于cord坐标，就清除下面的map和DOM结构
            if (limitMax < cordCol.top) {
                let cells = rootGetters.cellsByVertical({
                    startColIndex: cordColIndex,
                    endColIndex: lastColIndex,
                    startRowIndex: firstRowIndex,
                    endRowIndex: lastRowIndex
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: false
                    })
                }
                commit('M_COLS_UPDATE_VIEW', {
                    isView: false,
                    startIdx: cordColIndex,
                    overIdx: lastColIndex
                })
                delView({
                    alias: lastColAlias,
                    final: true
                })
            }
        }
        // 滚动方向： UP
        // 向上滚动时，加载被隐藏的DOM结构
        // 没有考虑向上滚动时，没有数据的情况
        // 基于目前的功能，不存在这种情况
        if (limitMin < firstColDistance) {
            let loadedIdx = rootGetters.loadedIdxByAlias({
                alias: firstColAlias,
                type: 'COLS'
            })
            let isFrozen = rootGetters.isFrozen()
            let frozenAlias = rootGetters.frozenAlias()
            let frozenAliasCol = frozenAlias.col

            // 冻结情况下，DOM的加载位置上限是冻结位置
            if (isFrozen && frozenAliasCol != null) {
                let neighborCol = rootGetters.neighborColByAlias(frozenAliasCol,
                    'NEXT')
                if (firstColAlias === neighborCol.alias) {
                    loadedIdx = -1
                }
            }
            if (loadedIdx !== 0 && loadedIdx !== -1) {
                let preCol = allLoaded.cols[loadedIdx - 1]
                let preColIdx = rootGetters.colIndexByAlias(preCol)
                commit('M_COLS_UPDATE_VIEW', {
                    isView: true,
                    startIdx: preColIdx,
                    overIdx: firstColIndex
                })
                let cells = rootGetters.cellsByVertical({
                    startRowIndex: firstRowIndex,
                    endRowIndex: lastRowIndex,
                    startColIndex: preColIdx,
                    endColIndex: firstColIndex
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: true
                    })
                }
                insertView({
                    firstAlias: firstColAlias,
                    neighborAlias: preCol
                })
            }
        }
        // 判断滚动的距离是否需要触发加载行为
        // 1. 不需要就什么都不做
        // 2. 需要的话，
        //  2.1. 当前记录点，所在的索引是否是最后一个，
        //   2.1.1. 如果是，就把最后一个对象的高端 + preHeight，作为请求的上下范围
        //   2.1.2. 如果不是，把下一个索引和这个索引之间的所有对象，row，col，cell全部
        //          置成show模式
        // 滚动方向： 向下
        if (limitMax > lastColDistance) {

            // 有这个记录点，并且这个记录点不是在最后一个位置，说明不需要请求后台
            let allRowMap = allLoaded.colMap.get(lastColAlias)
            let needRequire = allRowMap != null &&
                allRowMap.get(lastRowAlias) &&
                allLoaded.cols.length - lastColIndex > 1 ? false : true
            if (needRequire) {

                // 考虑到行、列都会有一个边框，所以需要在每个元素上 +1
                // 如果显示的结束行距离大于表格的最大行数，
                // 就需要改为增加行请求，不然就是请求行
                lastColDistance += 1
                return lastColDistance >= max.colPixel ?
                    expand() : require()
            } else {
                let loadedIdx = rootGetters.loadedIdxByAlias({
                    alias: lastColAlias,
                    type: 'COLS'
                })
                let nextCol = allLoaded.cols[loadedIdx + 1]
                let nextColIdx = rootGetters.colIndexByAlias(nextCol)
                commit('M_COLS_UPDATE_VIEW', {
                    isView: true,
                    startIdx: lastColIndex,
                    overIdx: nextColIdx
                })
                let cells = rootGetters.cellsByVertical({
                    startRowIndex: firstRowIndex,
                    endRowIndex: lastRowIndex,
                    startColIndex: lastColIndex,
                    endColIndex: nextColIdx
                })
                if (cells != null) {
                    commit('M_CELLS_UPDATE_VIEW', {
                        cells,
                        isView: true
                    })
                }
                addView(nextCol)
            }
        }
        // ---------------
        // 由于涉及到传入的viewload参数修改问题
        // 理应放到回到函数中处理，但是涉及的内容跟
        // 业务结合紧密且不会立即返回，所以
        // 暂时用内部函数代替
        // ---------------
        /**
         * 增加列
         * @return {[type]} [description]
         */
        function expand() {
            let num = config.prestrainWidth / (config.colWidth + 1)
            send({
                url: config.url.createLine,
                body: JSON.stringify({
                    type: 'col',
                    num
                })
            }).then(() => {
                let last = lastCol()
                for (let i = 0; i < num; i++) {
                    dispatch(actionTypes.COLS_ADD, [{
                        sort: last.sort + i + 1,
                        left: last.left + last.width + 1 +
                            config.colWidth * i
                    }])
                    if (i === num - 1) {
                        last = lastCol()
                        addView(last.alias)
                    }
                }

                function lastCol() {
                    let cols = rootGetters.allCols
                    return cols[cols.length - 1]
                }
            })
        }
        /**
         * 请求数据从已经存在的数据表中
         * @return {[type]} [description]
         */
        function require() {
            let right = Math.min(lastColDistance + config.prestrainWidth, max
                .colPixel)
            return send({
                url: config.url.area,
                body: JSON.stringify({
                    top: firstRow.top + 1,
                    bottom: lastRow.top + lastRow.height,
                    left: lastColDistance + 1,
                    right
                })
            }, false).then(function(data) {
                let cols = data.gridLineCol
                if (rootGetters.getColByAlias(cols[0].alias) == null) {
                    dispatch(actionTypes.COLS_ADD, cols)
                    commit('M_SHEETS_UPDATE_FROZEN', {
                        type: 'COL',
                        value: cols[cols.length - 1].alias
                    })
                }
                if (data.cells.length !== 0) {
                    dispatch(actionTypes.A_CELLS_ADD, data.cells)
                }
                let backColAlias = cols[cols.length - 1].alias
                commit('M_SHEETS_ADD_LOADED', {
                    rowAlias: lastRow.alias,
                    colAlias: backColAlias
                })
                addView(backColAlias)
            })
        }
        /**
         * 添加map信息，最后面
         * @param {[type]} alias [description]
         */
        function addView(alias) {
            for (let i = 1; i < rowLen; i++) {
                let item = viewLoaded.rows[i]
                viewLoaded.colMap.set(alias,
                    new Map().set(item, true))
                viewLoaded.rowMap.get(item)
                    .set(alias, true)
            }
            viewLoaded.cols.push(alias)
        }
        /**
         * 在最前面插入map信息
         * @param  {[type]} options.firstAlias    [description]
         * @param  {[type]} options.neighborAlias [description]
         * @return {[type]}                       [description]
         */
        function insertView({
            firstAlias,
            neighborAlias
        }) {
            let colItem = new Map()
            let rowMap = viewLoaded.rowMap
            viewLoaded.colMap.set(firstAlias, colItem)
            for (let i = 1; i < rowLen; i++) {
                let item = viewLoaded.rows[i]
                colItem.set(item, true)
                rowMap.get(item).set(firstAlias, true)
            }
            viewLoaded.cols.splice(0, 0, neighborAlias)
        }
        /**
         * 删除map信息
         * @param  {[boolean]} final [是否在最后删除]
         * @return {[type]}       [description]
         */
        function delView({
            alias,
            final = false
        }) {
            let colMap = viewLoaded.colMap
            let rowMap = viewLoaded.rowMap
            colMap.forEach((colValue, colKey) => {
                if (colKey === alias) {
                    colValue.forEach((rowValue, rowKey) => {
                        rowMap.get(rowKey).delete(colKey)
                    })
                }
            })
            colMap.delete(alias)
            let cols = viewLoaded.cols
            if (final) {
                cols.splice(cols.length - 1, 1)
            } else {
                cols.splice(0, 1)
            }
        }
        // this.scrollToBottom({
        //     limitTop,
        //     limitBottom
        // }).then(function() {
        // this.$store.commit(mutationTypes.UPDATE_USERVIEW, {
        //     top: this.recordScrollTop + this.offsetTop,
        //     bottom: limitBottom
        // })
        // })
        console.log(viewLoaded.cols)
        console.log(viewLoaded.colMap)
        console.log(allLoaded)
    }
}