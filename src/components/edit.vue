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
                rows: [this.rowStart, this.rowOver],
                cols: [this.colStart, this.colOver],
                rowMap: new Map().set(this.rowOver,
                    new Map().set(this.colOver, true)),
                colMap: new Map().set(this.colOver,
                    new Map().set(this.rowOver, true))
            },
            timeoutId: -1,
            toward: null,
            offsetLeft: this.$store.getters.offsetLeft(this.colStart, this.colOver),
            offsetTop: this.$store.getters.offsetTop(this.rowStart, this.rowOver)
        }
    },
    mounted() {
        console.log(this.viewLoaded)
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
            // 如果视图的最后元素和已经加载元素一致
            // 说明不是冻结视图 需要考虑上下边框的距离
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
            let limitMin
            let limitMax
            let actionsName
            if (toward === 'DOWN' || toward === 'UP') {
                let limitTop = scrollTop - config.scrollBufferHeight

                // limitTop 小于等于0，就是最顶端
                limitTop = limitTop > 0 ? limitTop : 0
                limitTop += this.offsetTop
                let limitBottom = limitTop + this.$el.clientHeight +
                    config.scrollBufferHeight + this.offsetTop
                actionsName = 'SHEET_SCROLL_VERTICAL'
                limitMin = limitTop
                limitMax = limitBottom
            }
            if (toward === 'LEFT' || toward === 'RIGHT') {
                let limitLeft = scrollLeft - config.scrollBufferWidth
                limitLeft = limitLeft > 0 ? limitLeft : 0
                limitLeft += this.offsetLeft
                let limitRight = limitLeft + this.$el.clientWidth +
                    config.scrollBufferWidth + this.offsetLeft
                actionsName = 'SHEET_SCROLL_TRANSVERSE'
                limitMin = limitLeft
                limitMax = limitRight
            }
            this.$store.dispatch(actionsName, {
                limitMin,
                limitMax,
                viewLoaded: this.viewLoaded
            })
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
                            let index = this.$store.getters.colIndexByAlias(firstCol.alias)
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