<template>
<div class="row-head-panel"
     ref="panel"
     @mousedown="mouseDownHandle"
     @mousemove="mouseMoveHandle">
    <row-head-item v-for="row in rowList"
                   :key="row.alias"
                   :row="row"
                   :offsetTop="offsetTop">
    </row-head-item>
    <row-head-item class="adjust-row-head-item"
                   v-if="adjustState"
                   ref="adjustRowView"
                   :offsetTop="offsetTop"
                   :row="adjustRow">
    </row-head-item>
    <div class="temp-space-container"
         v-if="adjustState"
         ref="adjustPanelView">
        <row-head-item v-for="row in adjustRowList"
                       :key="row.alias"
                       :row="row"
                       :offsetTop="offsetTop">
        </row-head-item>
    </div>
</div>
</template>
<script type="text/javascript">
import RowHeadItem from './row-head-item.vue'
import {
    SELECTS_UPDATESELECT,
    ROWS_ADJUSTHEIGHT
} from '../store/action-types'
import {
    UPDATE_MOUSESTATE
} from '../store/mutation-types'
import {
    LOCATE,
    DRAG
} from '../tools/constant'

export default {
    props: ['frozenRule'],
    data() {
        let startIndex
        let endIndex
        if (this.frozenRule) {
            startIndex = this.frozenRule.startRowIndex
            endIndex = this.frozenRule.endRowIndex
        }

        return {
            startIndex,
            endIndex,
            adjustState: false,
            adjustRow: null,
            adjustRowIndex: null
        }
    },
    components: {
        RowHeadItem
    },
    computed: {
        offsetTop() {
            if (this.frozenRule) {
                return this.frozenRule.offsetTop
            } else {
                return 0
            }
        },
        rowList() {
            let getters = this.$store.getters
            let rows = getters.rowList
            let visibleRows = getters.visibleRowList
            let frozenRule = this.frozenRule
            let startRowIndex
            let endRowIndex
            let lastRow
            let startRow

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex
                if (frozenRule.endRowIndex != null) {
                    endRowIndex = frozenRule.endRowIndex
                } else {
                    endRowIndex = visibleRows.length - 1
                }
                startRow = rows[startRowIndex]
                lastRow = rows[endRowIndex]
                startRowIndex = getters.getVisibleRowIndexBySort(startRow.sort)
                endRowIndex = getters.getVisibleRowIndexBySort(lastRow.sort)
                return visibleRows.slice(startRowIndex, endRowIndex + 1)
            } else {
                return getters.userViewRowList
            }
        },
        adjustRowList() {
            let rowList = this.$store.getters.rowList
            return rowList.slice(this.adjustRowIndex + 1)
        },
        mouseState() {
            return this.$store.state.mouseState
        }
    },
    methods: {
        getRelativePosi(posi) {
            let elem = this.$refs.panel
            let box = elem.getBoundingClientRect()
            let offsetTop = this.offsetTop
            return posi - box.top + offsetTop
        },
        mouseDownHandle(e) {
            this.currentMouseDownState(e)
        },
        mouseMoveHandle(e) {
            this.currentMouseMoveState(e)
        },
        currentMouseMoveState(e) {
            console.log('empty function')
        },
        currentMouseDownState(e) {
            console.log('empty function')
        },
        locateState(e) {
            let rowPosi = this.getRelativePosi(e.clientY)
            let rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi)

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                startColIndex: 'MAX',
                startRowIndex: rowIndex
            })
            this.$store.commit(UPDATE_MOUSESTATE, {
                state: DRAG
            })
        },
        startAdjustHandleState(e) {
            let posi = this.getRelativePosi(e.clientY)
            let rowIndex = this.$store.getters.getRowIndexByPosi(posi)
            let rows = this.$store.getters.rowList
            let adjustHandle
            let self = this

            this.adjustRowIndex = rowIndex
            this.adjustRow = rows[rowIndex]
            this.adjustState = true

            if (!(adjustHandle = this.adjustHandle)) {

                adjustHandle = this.adjustHandle = function(e) {
                    self.adjustHandleState(e)
                }
            }

            document.addEventListener('mousemove', adjustHandle, false)
            this.currentMouseMoveState = function() {}

            function stopAdjustHandle(e) {
                document.removeEventListener('mousemove', adjustHandle)
                document.removeEventListener('mouseup', stopAdjustHandle)
                self.changeRowHeight(e)
            }
            document.addEventListener('mouseup', stopAdjustHandle)
        },
        routineMoveState(e) {
            if (this.adjustState) {
                return
            }

            let posi = this.getRelativePosi(e.clientY)
            let row = this.$store.getters.getRowByPosi(posi)
            let panel = this.$refs.panel

            if (row.height + row.top - posi < 5) {
                panel.style.cursor = 'row-resize'
                this.currentMouseDownState = this.startAdjustHandleState
            } else {
                panel.style.cursor = 'pointer'
                this.currentMouseDownState = this.locateState
            }
        },
        dragState(e) {
            let rowPosi = this.getRelativePosi(e.clientY)
            let rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi)

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                startColIndex: 'MAX',
                startRowIndex: rowIndex
            })
        },
        adjustHandleState(e) {
            let rowView = this.$refs.adjustRowView.$el
            let panelView = this.$refs.adjustPanelView
            let posi = this.getRelativePosi(e.clientY)
            let row = this.adjustRow
            let temp

            if ((temp = posi - row.top) > 5) {
                rowView.style.height = temp + 'px'
                panelView.style.top = temp - row.height + 'px'
            }
        },
        changeRowHeight() {
            this.adjustState = false
            this.currentMouseMoveState = this.routineMoveState
            let height = this.$refs.adjustRowView.$el.style.height
            height = parseInt(height.substring(0, height.length - 2), 10)

            this.$store.dispatch(ROWS_ADJUSTHEIGHT, {
                height,
                index: this.adjustRowIndex
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
.adjust-row-head-item {
    transition: 0s;
}
</style>
