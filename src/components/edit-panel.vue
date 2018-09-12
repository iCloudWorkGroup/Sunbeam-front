<template>
<div class="edit-panel"
     @mousedown="locateSelect"
     :style="{ width, height }">
    <row-grid-group
        :start="rowStart"
        :over="rowOver"
        :offsetTop="offsetTop"/>
    <col-grid-group
        :start="colStart"
        :over="colOver"
        :offsetLeft="offsetLeft"/>
    <cell-group
        :row-start="rowStart"
        :row-over="rowOver"
        :col-start="colStart"
        :col-over="colOver"
        :offsetTop="offsetTop"
        :offsetLeft="offsetLeft"/>
    <select-group
        :row-start="rowStart"
        :row-over="rowOver"
        :col-start="colStart"
        :col-over="colOver"
        :offsetTop="offsetTop"
        :offsetLeft="offsetLeft"/>
</div>
</template>
<script type="text/javascript">
import {
    SELECTS_CHANGE,
    SELECTS_INSERT
} from '../store/action-types'
import ColGridGroup from './col-grid-group.vue'
import RowGridGroup from './row-grid-group.vue'
import CellGroup from './cell-group.vue'
import SelectGroup from './select-group.vue'
import {
    LOCATE,
    DRAG
} from '../tools/constant'
import {
    unit
} from '../filters/unit'
import cache from '../tools/cache'
export default {
    props: [
        'rowStart',
        'rowOver',
        'colStart',
        'colOver',
        'offsetLeft',
        'offsetTop'
    ],
    components: {
        ColGridGroup,
        RowGridGroup,
        CellGroup,
        SelectGroup
    },
    computed: {
        width() {
            let colMap = this.$store.state.cols.map
            let startCol = colMap.get(this.colStart)
            let overCol = colMap.get(this.colOver)
            return unit(overCol.left + overCol.width - startCol.left)
        },
        height() {
            let rowMap = this.$store.state.rows.map
            let startRow = rowMap.get(this.rowStart)
            let overRow = rowMap.get(this.rowOver)
            return unit(overRow.top + overRow.height - startRow.top)
        },
        mouseState() {
            return this.$store.state.mouseState
        },
        selectState() {
            return this.$store.getters.activeType
        }
    },
    methods: {
        locateSelect(downEvent) {
            let getters = this.$store.getters
            let el = downEvent.currentTarget
            let clientRect = el.getBoundingClientRect()
            let col = getters.getColByPosi(downEvent.clientX - clientRect.left + this.offsetLeft)
            let row = getters.getRowByPosi(downEvent.clientY - clientRect.top + this.offsetTop)

            // 如果是选择数据源，需要判断数据源是否存在
            let selectState = this.$store.getters.activeType
            if (selectState === 'DATASOURCE' &&
                getters.selectByType(selectState) == null) {
                this.$store.dispatch(SELECTS_INSERT, {
                    colAlias: col.alias,
                    rowAlias: row.alias
                })
            }
            this.$store.dispatch(SELECTS_CHANGE, {
                activeColAlias: col.alias,
                activeRowAlias: row.alias
            })
            let mousedownEvents = cache.evenetList['mousedown']
            if (mousedownEvents != null) {
                let cols = this.$store.getters.allCols
                let rows = this.$store.getters.allRows
                for (let i = 0, len = mousedownEvents.length; i < len; i++) {
                    let select = getters.selectByType(this.selectState)
                    let startColIdx = select.signalSort.startCol
                    let endColIdx = select.signalSort.endCol
                    let startRowIdx = select.signalSort.startRow
                    let endRowIdx = select.signalSort.endRow
                    let arrCol = []
                    for (let i = startColIdx; i <= endColIdx; i++) {
                        let col = cols[i]
                        arrCol.push(col.displayName)
                    }
                    let arrRow = []
                    for (let i = startRowIdx; i <= endRowIdx; i++) {
                        let row = rows[i]
                        arrRow.push(row.displayName)
                    }
                    cache.evenetList['mousedown'][i].apply(this, [{
                        point: {
                            col: arrCol,
                            row: arrRow
                        }
                    }])
                }
            }
            // 拖动选择区域事件
            let bindSelectChange = selectChange.bind(this)
            document.addEventListener('mousemove', bindSelectChange)
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', bindSelectChange)
            })
            function selectChange(moveEvent) {
                let endCol = getters.getColByPosi(moveEvent.clientX - clientRect.left + this.offsetLeft)
                let endRow = getters.getRowByPosi(moveEvent.clientY - clientRect.top + this.offsetTop)
                this.$store.dispatch(SELECTS_CHANGE, {
                    activeColAlias: col.alias,
                    activeRowAlias: row.alias,
                    endColAlias: endCol.alias,
                    endRowAlias: endRow.alias
                })
                let regionChangeEvents = cache.evenetList['regionChange']
                let selectState = this.$store.getters.activeType
                if (regionChangeEvents != null) {
                    let cols = this.$store.getters.allCols
                    let rows = this.$store.getters.allRows
                    for (let i = 0, len = regionChangeEvents.length; i < len; i++) {
                        let select = getters.selectByType(selectState)
                        let startColIdx = select.signalSort.startCol
                        let endColIdx = select.signalSort.endCol
                        let startRowIdx = select.signalSort.startRow
                        let endRowIdx = select.signalSort.endRow
                        let arrCol = []
                        for (let i = startColIdx; i <= endColIdx; i++) {
                            let col = cols[i]
                            arrCol.push(col.displayName)
                        }
                        let arrRow = []
                        for (let i = startRowIdx; i <= endRowIdx; i++) {
                            let row = rows[i]
                            arrRow.push(row.displayName)
                        }
                        cache.evenetList['regionChange'][i].apply(this, [{
                            point: {
                                col: arrCol,
                                row: arrRow
                            }
                        }])
                    }
                }
            }

        },
        dragState(e) {
            let elem = this.$refs.panel
            let frozenRule = this.frozenRule
            let offsetLeft = 0
            let offsetTop = 0
            let box

            if (frozenRule) {
                offsetLeft = frozenRule.offsetLeft
                offsetTop = frozenRule.offsetTop
            }
            box = elem.getBoundingClientRect()

            let colPosi = e.clientX - box.left + offsetLeft
            let rowPosi = e.clientY - box.top + offsetTop
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)
            let rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi)

            this.$store.dispatch(SELECTS_CHANGE, {
                startColIndex: colIndex,
                startRowIndex: rowIndex
            })
        }
    },
    mounted() {
        this.currentMouseMoveState = this.routineMoveState
        this.$watch('mouseState', function(val) {
            if (val === DRAG) {
                this.currentMouseMoveState = this.dragState
            }
            if (val === LOCATE) {
                this.currentMouseMoveState = this.routineMoveState
            }
        })
    }
}
</script>
<style type="text/css">
.edit-panel {
    position: relative;
}
</style>
