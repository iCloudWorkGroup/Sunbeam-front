<template>
<div class="edit"
     @scroll="tabSurface"
     :style="{ width, height }">
    <edit-panel
        :row-start="rowStart"
        :row-over="rowOver"
        :col-start="colStart"
        :col-over="colOver"
        :offsetTop="offsetTop"
        :offsetLeft="offsetLeft"/>
</div>
</template>
<script type="text/javascript">
import EditPanel from './edit-panel.vue'
import config from '../config'
import cache from '../tools/cache'
import send from '../util/send'
import Vue from 'vue'
import * as actionTypes from '../store/action-types'
import * as mutationTypes from '../store/mutation-types'
import generator from '../tools/generator'
import {
    getColDisplayName,
    getRowDisplayName
} from '../util/displayname'
import {
    unit
} from '../filters/unit'
import scrollbar from '../util/scrollbar'

export default {
    props: [
        'rowStart',
        'rowOver',
        'colStart',
        'colOver',
        'needSider',
        'scrollTop',
        'scrollLeft'
    ],
    data() {
        return {
            // 当前可视区域所占用的加载区域
            viewLoaded: {
                rows: [this.rowOver],
                cols: [this.colOver],
                map: new Map().set(this.colOver, {
                    [this.rowOver]: true
                })
            },
            timeoutId: -1,
            toward: null,
            offsetLeft: this.$store.getters.offsetLeft(this.colStart, this.colOver),
            offsetTop: this.$store.getters.offsetTop(this.rowStart, this.rowOver)
        }
    },
    mounted() {
        if (this.scrollTop != null) {
            this.$el.scrollTop = this.scrollTop
        }
        if (this.scrollLeft != null) {
            this.$el.scrollLeft = this.scrollLeft
        }
        // this.setOccupy()
        // this.updateUserView()
    },
    beforeDestroy() {
        this.updateOccupy([], [])
    },
    computed: {
        width() {
            let cols = this.$store.state.cols
            let startCol = cols.map.get(this.colStart)
            let overCol = cols.map.get(this.colOver)
            let lastCol = cols.list[cols.list.length - 1]
            let limitWidth = 0
            if (overCol.alias === lastCol.alias) {
                limitWidth = cache.rootEl.offsetWidth - config.cornerWidth
                if (this.needSider) {
                    limitWidth -= scrollbar()
                }
            } else {
                limitWidth = overCol.left + overCol.width
            }
            return unit(limitWidth - startCol.left)
        },
        height() {
            let rows = this.$store.state.rows
            let startRow = rows.map.get(this.rowStart)
            let overRow = rows.map.get(this.rowOver)
            let lastRow = rows.list[rows.list.length - 1]
            let limitHeight = 0
            if (overRow.alias === lastRow.alias) {
                limitHeight = cache.rootEl.offsetHeight -
                config.cornerHeight - config.sheetSider
                if (this.needSider) {
                    limitHeight -= scrollbar()
                }
            } else {
                limitHeight = overRow.top + overRow.height
            }
            return unit(limitHeight - startRow.top)
        }
    },
    components: {
        EditPanel
    },
    methods: {
        tabSurface() {
            let scrollLeft = this.$el.scrollLeft
            let scrollTop = this.$el.scrollTop
            if (this._events['scrollPanel'] != null) {
                this.$emit('scrollPanel', {
                    scrollTop,
                    scrollLeft
                })
            }
            if (this.timeoutId !== -1) {
                clearTimeout(this.timeoutId)
            }
            this.timeoutId = setTimeout(function() {
                this.handleScroll({
                    scrollLeft,
                    scrollTop,
                    toward: this.toward
                })
            }.bind(this), 50)
        },
        handleScroll({
            scrollLeft,
            scrollTop,
            toward
        }) {
            if (toward === 'DOWN' || toward === 'UP') {
                let limitTop = scrollTop - config.scrollBufferHeight

                // limitTop 小于等于0，就是最顶端
                limitTop = limitTop > 0 ? limitTop : 0
                limitTop += this.offsetTop
                let limitBottom = limitTop + this.$el.clientHeight +
                    config.scrollBufferHeight + this.offsetTop
                this.$store.dispatch('SHEET_SCROLL', {
                    limitMin: limitTop,
                    limitMax: limitBottom,
                    viewLoaded: this.viewLoaded
                }).then(function(fixedViewLoad) {
                    if (fixedViewLoad != null) {
                        this.viewLoaded = fixedViewLoad
                    }
                }.bind(this))
            }
        },
        scrollToBottom(top, bottom) {

            // 算出当前视图的上下限制区域
            let rowList = this.$store.getters.allRows

            // 后台存储最大行数
            let localMaxBottom = cache.localRowPosi
            // 一次请求区域高度
            let bufferHeight = config.scrollBufferHeight
            // 已数据加载标记值
            let rowRecord = cache.rowRecord
            let regionRecord = cache.regionRecord

            let rowOccupy = this.rowOccupy.slice(0)
            let colOccupy = this.colOccupy.slice(0)
            let occupyEndRowAlias = rowOccupy[rowOccupy.length - 1]

            let occupyEndRow = this.$store.getters.getRowByAlias(occupyEndRowAlias)

            let occupyBottom = occupyEndRow.top + occupyEndRow.height

            let frozenRule = this.frozenRule
            let addRowNum = 0
            let self = this
            let limitBottom = bottom
            let limitTop = top
            limitBottom = parseInt(limitBottom, 0)
            /**
             * 当前视图边界值超过了后台对象的最大值
             * 需要自动增加列
             */
            let lastRow = rowList[rowList.length - 1]
            let maxBottom = lastRow.top + lastRow.height
            maxBottom = maxBottom > localMaxBottom ? maxBottom : localMaxBottom

            if (limitBottom > maxBottom && (!frozenRule || frozenRule.type === 'mainRule')) {
                addRowNum = Math.ceil((limitBottom - maxBottom + bufferHeight) / config.rowHeight)
                limitBottom = maxBottom
            }

            if (cache.localRowPosi === 0) {
                addRow()
                removeOccupyRow()
                this.updateOccupy(colOccupy, rowOccupy)
                return
            }

            new Promise(function(currentResolve) {
                getNextRow(currentResolve)
            }).then(function() {
                return new Promise(function(currentResolve) {
                    getRegion(currentResolve)
                })
            }).then(function() {
                addRow()
                removeOccupyRow()
                self.updateOccupy(colOccupy, rowOccupy)
            })
            /**
             * 当前视图边界值超过了已加载对象最大值
             * 起始值为当前所占块下边界
             * 终止值为视图边界+缓存高度
             */
            function getNextRow(resolve) {
                let lastRow = rowList[rowList.length - 1]
                let currentMaxBottom = lastRow.top + lastRow.height

                if (currentMaxBottom < limitBottom) {
                    limitBottom = limitBottom + bufferHeight
                    limitBottom = limitBottom < localMaxBottom ? limitBottom : localMaxBottom

                    self.verticalRequest(currentMaxBottom + 1, limitBottom, resolve,
                        function(alias) {
                            let occupyBottomAlias = rowOccupy[rowOccupy.length - 1]
                            let occupyBottomIndex = rowRecord.indexOf(occupyBottomAlias)
                            let temp = [] // 记录请求区间跨域加载块
                            temp.push(rowRecord[occupyBottomIndex])
                            for (let i = occupyBottomIndex + 1, len = rowRecord.length; i < len; i++) {
                                temp.push(rowRecord[i])
                                rowOccupy.push(rowRecord[i])
                            }
                            temp.push(alias)

                            for (let i = 0, len1 = colOccupy.length - 1; i < len1; i++) {
                                for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
                                    let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
                                        temp[j] + '_' + temp[j + 1]
                                    if (!regionRecord.get(sign)) {
                                        regionRecord.set(sign, true)
                                    }
                                }
                            }
                            rowOccupy.push(alias)
                            if (rowRecord.indexOf(alias) === -1) {
                                rowRecord.push(alias)
                            }
                            let lastRow = rowList[rowList.length - 1]
                            occupyBottom = lastRow.top + lastRow.height
                        })
                } else {
                    resolve()
                }
            }

            function getRegion(resolve) {
                if (occupyBottom < limitBottom) {
                    let temp = [occupyEndRowAlias]
                    let i = rowRecord.indexOf(occupyEndRowAlias) + 1

                    for (let len = rowRecord.length; i < len; i++) {
                        let row = self.$store.getters.getRowByAlias(rowRecord[i])

                        temp.push(row.alias)
                        rowOccupy.push(row.alias)
                        if (row.top + row.height > limitBottom) {
                            limitBottom = row.top + row.height
                            break
                        }
                    }
                    let flag = false
                    for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
                        for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
                            let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
                                temp[i] + '_' + temp[i + 1]
                            if (!regionRecord.get(sign)) {
                                regionRecord.set(sign, true)
                                flag = true
                            }
                        }
                    }
                    self.updateOccupy(colOccupy, rowOccupy)
                    if (flag) {
                        self.verticalRequest(occupyBottom + 1, limitBottom, resolve)
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            }

            function addRow() {
                addRowNum = addRowNum + rowList.length < config.maxRowNum ?
                    addRowNum : config.maxRowNum - rowList.length

                if (addRowNum > 0) {
                    self.sendGeneratorRowCol('row', addRowNum)
                    let tempAlias = rowList[rowList.length - 1].alias
                    let currentAlias

                    self.$store.dispatch(actionTypes.ROWS_GENERAT, addRowNum)

                    currentAlias = rowList[rowList.length - 1].alias

                    for (let i = 0, len = colOccupy.length - 1; i < len; i++) {
                        let sign = colOccupy[i] + '_' + colOccupy[i + 1] + '_' +
                            tempAlias + '_' + currentAlias
                        regionRecord.set(sign, true)
                    }
                    rowOccupy.push(currentAlias)
                    rowRecord.push(currentAlias)
                }
            }
            function removeOccupyRow() {
                let counter = 0
                for (let i = 0, len = rowOccupy.length; i < len; i++) {
                    let row = self.$store.getters.getRowByAlias(rowOccupy[i])
                    if (row.top > limitTop) {
                        counter--
                        break
                    }
                    counter++
                }
                for (let i = 0; i < counter; i++) {
                    rowOccupy.shift()
                }
            }
        },
        scrollToTop(top, bottom, resolve) {
            let rowOccupy = this.rowOccupy.slice(0)
            let colOccupy = this.colOccupy.slice(0)
            let rowRecord = cache.rowRecord
            let occupyStartRowAlias = rowOccupy[0]
            let occupyStartRow = this.$store.getters.getRowByAlias(occupyStartRowAlias)
            let currentTop = occupyStartRow.top
            let self = this
            let limitTop = top
            let limitBottom = bottom

            if (cache.localRowPosi === 0) {
                adjustOccupy()
                this.updateOccupy(colOccupy, rowOccupy)
                resolve()
                return
            }
            new Promise(function(currentResolve) {
                getTop(currentResolve)
            }).then(function() {
                adjustOccupy()
                self.updateOccupy(colOccupy, rowOccupy)
                resolve()
            })

            function getTop(resolve) {
                if (limitTop < currentTop) {
                    let regionRecord = cache.regionRecord
                    let temp = [rowOccupy[0]]
                    let i = rowRecord.indexOf(occupyStartRowAlias)

                    if (i === -1) {
                        return
                    }
                    i--
                    for (; i > -1; i--) {
                        let row = self.$store.getters.getRowByAlias(rowRecord[i])
                        temp.unshift(row.alias)
                        rowOccupy.unshift(row.alias)
                        if (row.top <= limitTop) {
                            limitTop = row.top
                            break
                        }
                    }
                    let flag = false
                    for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
                        for (let j = 0, len2 = colOccupy.length - 1; j < len2; j++) {
                            let sign = colOccupy[j] + '_' + colOccupy[j + 1] + '_' +
                                temp[i] + '_' + temp[i + 1]
                            if (!regionRecord.get(sign)) {
                                regionRecord.set(sign, true)
                                flag = true
                            }
                        }
                    }
                    if (flag) {
                        self.verticalRequest(limitTop, currentTop - 1, resolve)
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            }

            function adjustOccupy() {
                // 移除上方多余行
                let counter = 0
                for (let i = rowOccupy.length - 1; i > -1; i--) {
                    let row = self.$store.getters.getRowByAlias(rowOccupy[i])
                    if (row.top + row.height < limitBottom) {
                        counter--
                        break
                    }
                    counter++
                }
                for (let i = 0; i < counter; i++) {
                    rowOccupy.pop()
                }
            }
        },
        scrollToRight(left, right, resolve) {
            let getters = this.$store.getters
            let colList = getters.colList
            let localMaxRight = cache.localColPosi
            let bufferWidth = config.scrollBufferWidth
            let colRecord = cache.colRecord
            let colOccupy = this.colOccupy.slice(0)
            let rowOccupy = this.rowOccupy.slice(0)
            let regionRecord = cache.regionRecord
            let occupyEndColAlias = colOccupy[colOccupy.length - 1]
            let occupyEndCol = this.$store.getters.getColByAlias(occupyEndColAlias)
            let occupyRight = occupyEndCol.left + occupyEndCol.width
            let frozenRule = this.frozenRule
            let addColNum = 0
            let self = this
            let limitLeft = left
            let limitRight = right
            limitRight = parseInt(limitRight, 0)
            /**
             * 当前视图边界值超过了后台对象的最大值
             * 需要自动增加列
             */
            let lastCol = colList[colList.length - 1]
            let maxRight = lastCol.left + lastCol.width
            maxRight = maxRight > localMaxRight ? maxRight : localMaxRight
            if (limitRight > maxRight && (!frozenRule || frozenRule.type === 'mainRule')) {
                addColNum = Math.ceil((limitRight - maxRight + bufferWidth) / config.colWidth)
                limitRight = maxRight
            }

            if (cache.localRowPosi === 0) {
                addCol()
                removeOccupyCol()
                this.updateOccupy(colOccupy, rowOccupy)
                resolve()
                return
            }
            new Promise(function(currentResolve) {
                getNextCol(currentResolve)
            }).then(function() {
                return new Promise(function(currentResolve) {
                    getRight(currentResolve)
                })
            }).then(function() {
                addCol()
                removeOccupyCol()
                self.updateOccupy(colOccupy, rowOccupy)
                resolve()
            })

            /**
             * 当前视图边界值超过了已加载对象最大值
             * 起始值为当前所占块下边界
             * 终止值为视图边界+缓存高度
             */
            function getNextCol(resolve) {
                let lastCol = colList[colList.length - 1]
                let currentMaxRight = lastCol.left + lastCol.width
                if (currentMaxRight < limitRight) {
                    limitRight = limitRight + config.scrollBufferWidth
                    limitRight = limitRight < maxRight ? limitRight : maxRight
                    /**
                     * 横向请求
                     * 起始值为当前所占块右边界
                     * 终止值为视图边界+缓存宽度
                     */
                    self.transverseRequest(currentMaxRight + 1, limitRight, resolve,
                        function(alias) {
                            let occupyRightAlias = colOccupy[colOccupy.length - 1]
                            let occupyRightIndex = colRecord.indexOf(occupyRightAlias)
                            let temp = [] // 记录请求区间跨域加载块

                            for (let i = occupyRightIndex, len = colRecord.length; i < len; i++) {
                                temp.push(colRecord[i])
                            }

                            temp.push(alias)

                            for (let i = 0, len1 = rowOccupy.length - 1; i < len1; i++) {
                                for (let j = 0, len2 = temp.length - 1; j < len2; j++) {
                                    let sign = temp[j] + '_' + temp[j + 1] + '_' +
                                        rowOccupy[i] + '_' + rowOccupy[i + 1]
                                    if (!regionRecord.get(sign)) {
                                        regionRecord.set(sign, true)
                                    }
                                }
                            }
                            colOccupy.push(alias)
                            if (colRecord.indexOf(alias) === -1) {
                                colRecord.push(alias)
                            }
                        })
                } else {
                    resolve()
                }
            }

            function getRight(resolve) {
                if (occupyRight < limitRight) {
                    let temp = [occupyEndColAlias]
                    let i = colRecord.indexOf(occupyEndColAlias) + 1

                    for (let len = colRecord.length; i < len; i++) {
                        let col = self.$store.getters.getColByAlias(colRecord[i])
                        temp.push(col.alias)
                        colOccupy.push(col.alias)
                        if (col.left + col.width > limitRight) {
                            limitRight = col.left + col.width
                            break
                        }
                    }
                    let flag = false
                    for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
                        for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
                            let sign = temp[i] + '_' + temp[i + 1] + '_' +
                                rowOccupy[j] + '_' + rowOccupy[j + 1]
                            if (!regionRecord.get(sign)) {
                                regionRecord.set(sign, true)
                                flag = true
                            }
                        }
                    }
                    if (flag) {
                        self.transverseRequest(occupyRight + 1, limitRight, resolve)
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            }

            function addCol() {
                addColNum = addColNum + colList.length < config.maxColNum ?
                    addColNum : config.maxColNum - colList.length

                if (addColNum > 0) {
                    self.sendGeneratorRowCol('col', addColNum)
                    let tempAlias = colList[colList.length - 1].alias
                    let currentAlias

                    self.$store.dispatch(actionTypes.COLS_GENERAT, addColNum)
                    currentAlias = colList[colList.length - 1].alias

                    for (let i = 0, len = rowOccupy.length - 1; i < len; i++) {
                        let sign = tempAlias + '_' + currentAlias + '_' +
                            rowOccupy[i] + '_' + rowOccupy[i + 1]
                        regionRecord.set(sign, true)
                    }
                    colOccupy.push(currentAlias)
                    colRecord.push(currentAlias)
                }
            }

            function removeOccupyCol() {
                // 移除左侧多余列
                let counter = 0
                for (let i = 0, len = colOccupy.length; i < len; i++) {
                    let col = self.$store.getters.getColByAlias(colOccupy[i])
                    if (col.left > limitLeft) {
                        counter--
                        break
                    }
                    counter++
                }

                for (let i = 0; i < counter; i++) {
                    colOccupy.shift()
                }
            }
        },
        scrollToLeft(left, right, resolve) {
            let colOccupy = this.colOccupy.slice(0)
            let rowOccupy = this.rowOccupy.slice(0)
            let occupyStartColAlias = colOccupy[0]
            let occupyStartCol = this.$store.getters.getColByAlias(occupyStartColAlias)
            let currentLeft = occupyStartCol.left
            let colRecord = cache.colRecord
            let self = this
            let limitLeft = left
            let limitRight = right

            if (cache.localRowPosi === 0) {
                adjustOccupy()
                this.updateOccupy(colOccupy, rowOccupy)
                resolve()
                return
            }
            new Promise(function(currentResolve) {
                getLeft(currentResolve)
            }).then(function() {
                adjustOccupy()
                self.updateOccupy(colOccupy, rowOccupy)
                resolve()
            })

            function getLeft(resolve) {
                if (limitLeft < 0) {
                    limitLeft = 0
                }

                if (limitLeft < currentLeft) {
                    let regionRecord = cache.regionRecord
                    let temp = [colOccupy[0]]
                    let i = colRecord.indexOf(occupyStartColAlias) - 1

                    if (i === -1) {
                        return
                    }
                    for (; i > -1; i--) {
                        let col = self.$store.getters.getColByAlias(colRecord[i])
                        temp.unshift(col.alias)
                        colOccupy.unshift(col.alias)
                        if (col.left <= limitLeft) {
                            limitLeft = col.left
                            break
                        }
                    }
                    let flag = false
                    for (let i = 0, len1 = temp.length - 1; i < len1; i++) {
                        for (let j = 0, len2 = rowOccupy.length - 1; j < len2; j++) {
                            let sign = temp[i] + '_' + temp[i + 1] + '_' +
                                rowOccupy[j] + '_' + rowOccupy[j + 1]
                            if (!regionRecord.get(sign)) {
                                regionRecord.set(sign, true)
                                flag = true
                            }
                        }
                    }
                    if (flag) {
                        self.transverseRequest(limitLeft, currentLeft - 1, resolve)
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            }
            // 移除右侧多余列
            function adjustOccupy() {
                let counter = 0

                for (let i = colOccupy.length - 1; i > -1; i--) {
                    let col = self.$store.getters.getColByAlias(colOccupy[i])
                    if (col.left + col.width < limitRight) {
                        counter--
                        break
                    }
                    counter++
                }
                for (let i = 0; i < counter; i++) {
                    colOccupy.pop()
                }
            }
        },
        transverseRequest(left, right, resolve, fn) {
            let startRowAlias = this.rowOccupy[0]
            let endRowAlias = this.rowOccupy[this.rowOccupy.length - 1]
            let startRow = this.$store.getters.getRowByAlias(startRowAlias)
            let endRow = this.$store.getters.getRowByAlias(endRowAlias)
            let top = startRow.top
            let bottom = endRow.top + endRow.height

            send({
                url: 'sheet/area',
                isPublic: false,
                data: JSON.stringify({
                    left,
                    top,
                    right,
                    bottom
                }),
                success: data => {
                    if (fn) {
                        let colData = data.gridLineCol
                        let endColAlias = colData[colData.length - 1].alias
                        let firstCol = colData[0]

                        if (firstCol.hidden) {
                            let index = this.$store.getters.getColIndexByAlias(firstCol.alias)
                            if (index > 0) {
                                let cols = this.$store.getters.colList
                                this.$store.commit(mutationTypes.UPDATE_COL, {
                                    col: cols[index - 1],
                                    props: {
                                        rightAjacentHide: true
                                    }
                                })
                            }
                        }
                        for (let i = 0, len = colData.length; i < len; i++) {
                            let col = colData[i]
                            if (col.hidden && i > 0) {
                                colData[i - 1].rightAjacentHide = true
                            }
                            col.displayName = getColDisplayName(col.sort)
                        }
                        this.$store.dispatch(actionTypes.COLS_RESTORECOLS, colData)
                        fn(endColAlias)
                    }
                    let cells = data.cells
                    cells.forEach(function(cell) {
                        cell.alias = generator.cellAliasGenerator()
                    })
                    this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells)
                    resolve()
                }
            })
        },
        verticalRequest(top, bottom, resolve, fn) {
            let startColAlias = this.colOccupy[0]
            let endColAlias = this.colOccupy[this.colOccupy.length - 1]
            let startCol = this.$store.getters.getColByAlias(startColAlias)
            let endCol = this.$store.getters.getColByAlias(endColAlias)
            let left = startCol.left
            let right = endCol.left + endCol.width
            return send({
                url: 'sheet/area',
                isPublic: false,
                data: JSON.stringify({
                    left,
                    top,
                    right,
                    bottom
                }),
                success: (data) => {
                    if (fn) {
                        let rowData = data.gridLineRow
                        let endRowAlias = rowData[rowData.length - 1].alias
                        let firstRow = rowData[0]

                        if (firstRow.hidden) {
                            let index = this.$store.getters.getRowIndexByAlias(firstRow.alias)
                            if (index > 0) {
                                let rows = this.$store.getters.rowList
                                this.$store.commit(mutationTypes.UPDATE_ROW, {
                                    row: rows[index - 1],
                                    props: {
                                        bottomAjacentHide: true
                                    }
                                })
                            }
                        }
                        for (let i = 0, len = rowData.length; i < len; i++) {
                            let row = rowData[i]
                            if (row.hidden && i > 0) {
                                rowData[i - 1].bottomAjacentHide = true
                            }
                            row.displayName = getRowDisplayName(row.sort)
                        }

                        this.$store.dispatch(actionTypes.ROWS_RESTOREROWS, rowData)
                        fn(endRowAlias)
                    }
                    let cells = data.cells
                    cells.forEach(function(cell) {
                        cell.alias = generator.cellAliasGenerator()
                    })
                    this.$store.dispatch(actionTypes.CELLS_RESTORECELL, cells)
                    resolve()
                }
            })
        },
        updateOccupy(colOccupy, rowOccupy) {
            this.$store.dispatch(actionTypes.OCCUPY_UPDATE, {
                type: this.frozenRule && this.frozenRule.type,
                col: colOccupy,
                row: rowOccupy
            })
        },
        setOccupy() {
            let getters = this.$store.getters
            let colList = getters.colList
            let rowList = getters.rowList
            let offsetLeft = this.$el.scrollLeft
            let offsetTop = this.$el.scrollTop
            let clientWidth = this.$el.clientWidth
            let clientHeight = this.$el.clientHeight
            let startRowIndex = 0
            let startColIndex = 0
            let endColIndex
            let endRowIndex
            let frozenRule = this.frozenRule
            let colOccupy = []
            let rowOccupy = []
            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex
                startColIndex = frozenRule.startColIndex
                endRowIndex = frozenRule.endRowIndex
                endColIndex = frozenRule.endColIndex

                offsetTop += frozenRule.offsetTop
                offsetLeft += frozenRule.offsetLeft
            }

            endColIndex = typeof endColIndex !== 'undefined' ? endColIndex :
                getters.getColIndexByPosi(offsetLeft + clientWidth +
                    config.prestrainWidth)

            endRowIndex = typeof endRowIndex !== 'undefined' ? endRowIndex :
                getters.getRowIndexByPosi(offsetTop + clientHeight +
                    config.prestrainHeight)
            let colRecord = cache.colRecord
            let rowRecord = cache.rowRecord
            let startCol = colList[startColIndex]
            let endCol = colList[endColIndex]
            let startRow = rowList[startRowIndex]
            let endRow = rowList[endRowIndex]

            for (let i = 0, len = colRecord.length - 1; i < len; i++) {
                let col = getters.getColByAlias(colRecord[i])
                let nextCol = getters.getColByAlias(colRecord[i + 1])

                if (col.left <= startCol.left && nextCol.left > startCol.left) {
                    colOccupy.push(colRecord[i])
                }
                if (col.left > startCol.left && col.left < endCol.left) {
                    colOccupy.push(colRecord[i])
                }
                if (col.left < endCol.left && nextCol.left >= endCol.left) {
                    colOccupy.push(colRecord[i + 1])
                }
            }

            for (let i = 0, len = rowRecord.length - 1; i < len; i++) {
                let row = getters.getRowByAlias(rowRecord[i])
                let nextRow = getters.getRowByAlias(rowRecord[i + 1])

                if (row.top <= startRow.top && nextRow.top > startRow.top) {
                    rowOccupy.push(rowRecord[i])
                }
                if (row.top > startRow.top && row.top < endRow.top) {
                    rowOccupy.push(rowRecord[i])
                }
                if (row.top < endRow.top && nextRow.top >= endRow.top) {
                    rowOccupy.push(rowRecord[i + 1])
                }
            }
            this.updateOccupy(colOccupy, rowOccupy)
        },
        updateUserView() {
            let frozenRule = this.frozenRule
            if (!frozenRule || frozenRule.type === 'mainRule') {
                this.$store.commit(mutationTypes.UPDATE_USERVIEW, {
                    left: this.offsetLeft,
                    top: this.offsetTop,
                    right: this.offsetLeft + this.$el.clientWidth + config.prestrainWidth,
                    bottom: this.offsetTop + this.$el.clientHeight + config.prestrainHeight
                })
            }
        },
        sendGeneratorRowCol(type, num) {
            send({
                url: config.url['addrowcol'],
                data: JSON.stringify({
                    type,
                    num
                })
            })
        }
    },
    watch: {
        frozenRule(newVal, oldVal) {
            let self = this
            Vue.nextTick(function() {
                if (newVal) {
                    self.$el.scrollTop = 0
                    self.$el.scrollLeft = 0
                    self.offsetLeft = self.frozenRule ? self.frozenRule.offsetLeft : 0
                    self.offsetTop = self.frozenRule ? self.frozenRule.offsetTop : 0
                    clearTimeout(self.timeoutId)
                    self.handleScroll(0, 0)
                } else {
                    self.offsetLeft = 0
                    self.offsetTop = 0
                    self.$el.scrollTop = oldVal.userViewTop
                    self.$el.scrollLeft = oldVal.userViewLeft
                    clearTimeout(self.timeoutId)
                    self.handleScroll(oldVal.userViewLeft, oldVal.userViewTop)
                }
                self.setOccupy()
                self.updateUserView()
            })
        },
        scrollLeft(now, before) {
            if (now != null) {
                this.$el.scrollLeft = now
                if (before !== now) {
                    if (before > now) {
                        this.toward = 'LEFT'
                    }
                    if (before < now) {
                        this.toward = 'RIGHT'
                    }
                }
            }
        },
        scrollTop(now, before) {
            if (now != null) {
                this.$el.scrollTop = now
                if (before !== now) {
                    if (before > now) {
                        this.toward = 'UP'
                    }
                    if (before < now) {
                        this.toward = 'DOWN'
                    }
                }
            }
        },
        colMaxPosi(newVal, oldVal) {
            let frozenRule = this.frozenRule
            if (newVal < oldVal && (!frozenRule || typeof frozenRule.endColIndex === 'undefined')) {
                this.handleScroll(this.recordScrollLeft, this.recordScrollTop, true, false)
            }
        },
        rowMaxPosi(newVal, oldVal) {
            let frozenRule = this.frozenRule
            if (newVal < oldVal && (!frozenRule || typeof frozenRule.endRowIndex === 'undefined')) {
                this.handleScroll(this.recordScrollLeft, this.recordScrollTop, false, true)
            }
        }
    }
}

</script>
<style type="text/css">
.edit {
    overflow: hidden;
    background: white;
}

.scroll-box {
    overflow: auto;
}
</style>