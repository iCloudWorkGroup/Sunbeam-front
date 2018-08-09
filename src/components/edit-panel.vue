<template>
<div class="edit-panel"
     @mousedown="locateSelect"
     @mousemove=""
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
    SELECTS_CHANGE
} from '../store/action-types'
// import {
//     UPDATE_MOUSESTATE
// } from '../store/mutation-types'
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
export default {
    props: [
        'rowStart',
        'rowOver',
        'colStart',
        'colOver'
    ],
    components: {
        ColGridGroup,
        RowGridGroup,
        CellGroup,
        SelectGroup
    },
    computed: {
        offsetLeft() {
            return this.$store.getters.offsetLeft(this.colStart, this.colOver)
        },
        offsetTop() {
            return this.$store.getters.offsetTop(this.rowStart, this.rowOver)
        },
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
        }
    },
    methods: {
        locateSelect(e) {
            let getters = this.$store.getters
            let el = e.currentTarget
            let clientRect = el.getBoundingClientRect()
            let col = getters.getColByPosi(e.clientX - clientRect.left +
                this.offsetLeft)
            let row = getters.getRowByPosi(e.clientY - clientRect.top +
                this.offsetTop)
            this.$store.dispatch(SELECTS_CHANGE, {
                colAlias: col.alias,
                rowAlias: row.alias
            })
        },
        mouseMoveHandle(e) {
            this.currentMouseMoveState(e)
        },
        currentMouseMoveState() {
            console.log('empty function')
        },
        routineMoveState(e) {
            console.log('empty function')
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
