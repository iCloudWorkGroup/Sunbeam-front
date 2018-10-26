<template>
    <div class="edit"
         @scroll="tabSurface"
         @mouseup="updateShowScreen"
         @mousedown="mousedown"
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
// import cache from '../tools/cache'
import send from '../util/send'
import * as mutationTypes from '../store/mutation-types'
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
            timeoutId: -1,
            toward: null,
            offsetLeft: this.$store.getters.offsetLeft(this.colStart, this.colOver),
            offsetTop: this.$store.getters.offsetTop(this.rowStart, this.rowOver),
            nowTop: '',
            nowLeft: '',
            flag: true
        }
    },
    created() {
        // 当前可视区域所占用的加载区域
        // let isFrozen = this.$store.getters.isFrozen()
        // let frozenAlias = this.$store.getters.frozenAlias()
        // let neighborRow = this.$store.getters.neighborRowByAlias(this.rowStart, 'PRE')
        let rowAlias = this.rowStart
        // isFrozen &&
        // neighborRow != null &&
        // frozenAlias.row === neighborRow.alias ?
        //     neighborRow.alias :

        // let neighborCol = this.$store.getters.neighborColByAlias(this.colStart, 'PRE')
        let colAlias = this.colStart
        // isFrozen &&
        // neighborCol != null &&
        // frozenAlias.col === neighborCol.alias ?
        //     neighborCol.alias :
        this.viewLoaded = {
            rows: [rowAlias, this.rowOver],
            cols: [colAlias, this.colOver],
            rowMap: new Map().set(this.rowOver,
                new Map().set(this.colOver, true)),
            colMap: new Map().set(this.colOver,
                new Map().set(this.rowOver, true))
        }
        // this.viewLoaded.rowMap.set(this.rowStart, new Map().set(this.colStart, true))
        // this.viewLoaded.colMap.set(this.colStart, new Map().set(this.rowStart, true))
    },
    computed: {
        width() {
            let cols = this.$store.state.cols
            let startCol = cols.map.get(this.colStart)
            let overCol = cols.map.get(this.colOver)
            let lastCol = cols.list[cols.list.length - 1]
            let limitWidth = 0
            if (overCol.alias === lastCol.alias) {
                limitWidth = this.$store.getters.offsetWidth - config.cornerWidth
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
            let firstRow = rows.list[0]
            let limitHeight = 0
            limitHeight = this.$store.getters.offsetHeight - config.cornerHeight - config.sheetSider
            if (this.needSider) {
                limitHeight -= scrollbar()
            }
            // 如果视图的最后元素和已经加载元素一致
            // 说明不是冻结视图 需要考虑上下边框的距离
            if (startRow.alias === firstRow.alias &&
                overRow.alias === lastRow.alias) {
                return unit(limitHeight)
            }
            let isFrozen = this.$store.getters.isFrozen()
            let frozenAlias = this.$store.getters.frozenAlias()
            let frozenAliasRow = frozenAlias.row
            // let userView = this.$store.getters.userView()
            // 是冻结，并且行被冻结
            if (isFrozen && frozenAliasRow != null) {
                let frozenRow = this.$store.getters.getRowByAlias(
                    frozenAliasRow)
                let topDistance = frozenRow.top + frozenRow.height
                let neighborRow = this.$store.getters.neighborRowByAlias(frozenAliasRow, 'NEXT')
                // 如果冻结的行等于这个视图的行结束值，说明是上半部分的视图
                // 所以, 高度就是topDistance
                // 不然就是，limitHeight -  topDistance
                if (frozenAliasRow === this.rowOver) {
                    limitHeight = topDistance
                }
                if (neighborRow.alias === this.rowStart) {
                    limitHeight -= topDistance
                }
            }
            return unit(limitHeight)
        }
    },
    components: {
        EditPanel
    },
    methods: {
        mousedown() {
            this.flag = false
            this.nowTop = this.$el.scrollTop
            this.nowLeft = this.$el.scrollLeft
        },
        updateShowScreen() {
            let scrollLeft = this.$el.scrollLeft
            let scrollTop = this.$el.scrollTop
            if (!this.flag) {
                return
            }
            if (this.toward === 'LEFT' || this.toward === 'RIGHT') {
                let nowSrceen = this.getTransverseSrceen(this.viewLoaded.cols)
                let screen = this.fixTransverseScreen(scrollLeft)
                let fixScreen = []
                if (this.toward === 'LEFT') {
                    for (let i = 0; i < screen.length; i++) {
                        fixScreen[i] = screen[i] - 2
                    }
                } else {
                    fixScreen = screen
                }
                if (JSON.stringify(nowSrceen) === JSON.stringify(fixScreen)) {
                    return
                }
                for (let i = screen.length - 1; i >= 0; i--) {
                    let cols = this.fixCols(screen, i)
                    let rowsMap = this.fixRowMap(this.viewLoaded.rows, cols)
                    let colsMap = this.fixColMap(this.viewLoaded.rows, cols)
                    this.viewLoaded.cols = cols
                    this.viewLoaded.rowMap = rowsMap
                    this.viewLoaded.colMap = colsMap
                    if (cols.length === 0) {
                        return
                    }
                    this.handleScroll({
                        scrollLeft,
                        scrollTop,
                        toward: this.toward
                    })
                }
            } else if (this.toward === 'UP' || this.toward === 'DOWN') {
                let nowSrceen = this.getVerticalSrceen(this.viewLoaded.rows)
                let screen = this.fixVerticalScreen(scrollTop)
                let fixScreen = []
                if (this.toward === 'UP') {
                    for (let i = 0; i < screen.length; i++) {
                        fixScreen[i] = screen[i] - 2
                    }
                } else {
                    fixScreen = screen
                }
                if (JSON.stringify(nowSrceen) === JSON.stringify(fixScreen)) {
                    return
                }
                for (let i = screen.length - 1; i >= 0; i--) {
                    let rows = this.fixRows(screen, i)
                    let rowsMap = this.fixRowMap(rows, this.viewLoaded.cols)
                    let colsMap = this.fixColMap(rows, this.viewLoaded.cols)
                    if (rows.length === 0) {
                        return
                    }
                    this.viewLoaded.rows = rows
                    this.viewLoaded.rowMap = rowsMap
                    this.viewLoaded.colMap = colsMap
                    this.handleScroll({
                        scrollLeft,
                        scrollTop,
                        toward: this.toward
                    })
                }
            } else {
                return
            }
        },
        getTransverseSrceen(cols) {
            let loadedCols = this.$store.state.sheets.loaded.cols
            let nowSrceen = []
            let startSrceen
            let endSrceen
            loadedCols.forEach((item, index) => {
                if (item === cols[0]) {
                    startSrceen = index
                }
                if (item === cols[cols.length - 1]) {
                    endSrceen = index - 1
                }
            })
            for (let i = startSrceen; i <= endSrceen; i++) {
                nowSrceen.push(i)
            }
            return nowSrceen
        },
        getVerticalSrceen(rows) {
            let loadedRows = this.$store.state.sheets.loaded.rows
            let nowSrceen = []
            let startSrceen
            let endSrceen
            loadedRows.forEach((item, index) => {
                if (item === rows[0]) {
                    startSrceen = index
                }
                if (item === rows[rows.length - 1]) {
                    endSrceen = index - 1
                }
            })
            for (let i = startSrceen; i <= endSrceen; i++) {
                nowSrceen.push(i)
            }
            return nowSrceen
        },
        fixColMap(rows, cols) {
            let colMap = new Map()
            for (let j = 1; j < cols.length; j++) {
                for (let k = 0; k < rows.length; k++) {
                    // 列Map填充
                    let colItemMap
                    if (colMap.get(cols[j]) == null) {
                        colItemMap = new Map()
                        colMap.set(cols[j], colItemMap)
                    } else {
                        colItemMap = colMap.get(cols[j])
                    }
                    colItemMap.set(rows[k], true)
                }
            }
            return colMap
        },
        fixRowMap(rows, cols) {
            let rowMap = new Map()
            for (let j = 0; j < rows.length; j++) {
                for (let k = 1; k < cols.length; k++) {
                    // 列Map填充
                    let rowItemMap
                    if (rowMap.get(rows[j]) == null) {
                        rowItemMap = new Map()
                        rowMap.set(rows[j], rowItemMap)
                    } else {
                        rowItemMap = rowMap.get(rows[j])
                    }
                    rowItemMap.set(cols[k], true)
                }
            }
            return rowMap
        },
        fixRows(screen, i) {
            let rows
            let loadedRows = this.$store.state.sheets.loaded.rows
            rows = loadedRows.slice(screen[i] - 1, screen[i] + 1)
            return rows
        },
        fixCols(screen, i) {
            let cols
            let loadedCols = this.$store.state.sheets.loaded.cols
            cols = loadedCols.slice(screen[i] - 1, screen[i] + 1)
            return cols
        },
        fixTransverseScreen(scrollLeft) {
            let limitLeft = scrollLeft - config.scrollBufferWidth
            limitLeft = limitLeft > 0 ? limitLeft : 0
            limitLeft += this.offsetLeft
            let limitRight = limitLeft + this.$el.clientWidth +
                config.scrollBufferWidth + this.offsetLeft
            let loadedCols = this.$store.state.sheets.loaded.cols
            let allCol = this.$store.getters.allCols
            let screen = []
            loadedCols.forEach((item, index) => {
                if (index + 1 > loadedCols.length - 1) {
                    return
                }
                let colStartIdx = this.$store.getters.colIndexByAlias(item)
                let colEndIdx = this.$store.getters.colIndexByAlias(loadedCols[index + 1])
                if ((allCol[colStartIdx].left + allCol[colStartIdx].width) <= limitRight && (allCol[colEndIdx].left + allCol[colEndIdx].width) >= limitLeft) {
                    if (this.toward === 'LEFT') {
                        screen.push(index + 2)
                    } else {
                        screen.push(index)
                    }
                }
            })
            return screen
        },
        fixVerticalScreen(scrollTop) {
            let limitTop = scrollTop - config.scrollBufferHeight
            // limitTop 小于等于0，就是最顶端
            limitTop = limitTop > 0 ? limitTop : 0
            limitTop += this.offsetTop
            let limitBottom = limitTop + this.$el.clientHeight +
                config.scrollBufferHeight + this.offsetTop
            let loadedRows = this.$store.state.sheets.loaded.rows
            let allRow = this.$store.getters.allRows
            let screen = []
            loadedRows.forEach((item, index) => {
                if (index + 1 > loadedRows.length - 1) {
                    return
                }
                let rowStartIdx = this.$store.getters.rowIndexByAlias(item)
                let rowEndIdx = this.$store.getters.rowIndexByAlias(loadedRows[index + 1])
                if ((allRow[rowStartIdx].top + allRow[rowStartIdx].height) <= limitBottom && (allRow[rowEndIdx].top + allRow[rowEndIdx].height) >= limitTop) {
                    if (this.toward === 'UP') {
                        screen.push(index + 2)
                    } else {
                        screen.push(index)
                    }
                }
            })
            return screen
        },
        tabSurface() {
            this.flag = true
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
            }.bind(this), 10)
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
    },
    mounted() {
        // this.setOccupy()
        // this.updateUserView()
        // 火狐浏览器 添加鼠标滚轮事件监听
        let userAgent = navigator.userAgent
        if (userAgent.indexOf('Firefox') > -1) {
            let _this = this
            this.$el.addEventListener('DOMMouseScroll', function (e) {
                let delta = e.detail
                if (delta > 0) {
                    _this.$el.scrollTop += 20
                } else if (delta < 0) {
                    _this.$el.scrollTop = _this.$el.scrollTop > 20 ? _this.$el.scrollTop - 20 : 0
                }
            })
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