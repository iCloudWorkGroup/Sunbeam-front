<template>
<div class="row-head-panel"
     ref="panel"
     @mousedown="mouseDownHandle"
     @mousemove="mouseMoveHandle" >
    <row-head-item
        v-for="row in viewRows"
        :key="row.alias"
        :row="row"
        :offsetTop="offsetTop"/>
    <row-head-item
        class="adjust-row-head-item"
       ref="adjustRowView"
       v-if="adjustState"
       :offsetTop="offsetTop"
       :row="adjustRow"/>
    <div class="temp-space-container"
         ref="adjustPanelView">
        <row-head-item
            v-for="row in adjustRows"
            v-if="adjustState"
            :key="row.alias"
            :row="row"
            :offsetTop="offsetTop"/>
    </div>
</div>
</template>
<script type="text/javascript">
import RowHeadItem from './row-head-item.vue'
import {
    SELECTS_CHANGE,
    ROWS_ADJUSTHEIGHT
} from '../store/action-types'
// import {
//     UPDATE_MOUSESTATE
// } from '../store/mutation-types'
import {
    LOCATE,
    DRAG
} from '../tools/constant'

export default {
    props: ['start', 'over', 'offsetTop'],
    data() {
        return {
            adjustState: false,
            adjustRow: '',
            adjustRowIndex: '',
            firstRowAlias: ''
        }
    },
    components: {
        RowHeadItem
    },
    computed: {
        viewRows() {
            return this.$store.getters.rowsByRange(this.start, this.over)
        },
        adjustRows() {
            let rowList = this.$store.getters.allRows
            return rowList.slice(this.adjustRowIndex + 1)
        },
        mouseState() {
            return this.$store.state.selects.mouseState
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
        routineMoveState(e) {
            if (this.adjustState) {
                return
            }
            let posi = this.getRelativePosi(e.clientY)
            let row = this.$store.getters.getRowByPosi(posi)
            let panel = this.$refs.panel
            let rows = this.$store.getters.allRows
            let rowIndex = this.$store.getters.getRowIndexByPosi(posi)

            if (row.height + row.top - posi < 3) {
                panel.style.cursor = 'row-resize'
                this.adjustRowIndex = rowIndex
                this.adjustRow = rows[rowIndex]
                this.currentMouseDownState = this.startAdjustHandleState
            } else if (posi - row.top < 3 && rowIndex !== 0) {
                if (rows[rowIndex - 1].hidden) {
                    return
                }
                panel.style.cursor = 'row-resize'
                this.adjustRowIndex = rowIndex - 1
                this.adjustRow = rows[rowIndex - 1]
                this.currentMouseDownState = this.startAdjustHandleState
            } else {
                panel.style.cursor = 'pointer'
                this.currentMouseDownState = this.locateState
                // this.currentMouseDownState = this.dragState
            }
        },
        startAdjustHandleState(e) {
            let adjustHandle
            let self = this

            this.adjustState = true

            this.$store.commit('M_SELECT_UPDATE_MOUSESTATUS', 'LOCATE')
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
        adjustHandleState(e) {
            let rowView = this.$refs.adjustRowView.$el
            let panelView = this.$refs.adjustPanelView
            let posi = this.getRelativePosi(e.clientY)
            let row = this.adjustRow
            let temp

            if ((temp = posi - row.top) >= 0) {
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
        },
        locateState(e) {
            this.$store.commit('M_SELECT_UPDATE_MOUSESTATUS', 'DRAG')
            let rowPosi = this.getRelativePosi(e.clientY)
            let rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi)
            let rowAlias = this.$store.getters.allRows[rowIndex].alias
            let firstColAlias = this.$store.getters.visibleColList()[0].alias
            this.$store.dispatch(SELECTS_CHANGE, {
                activeColAlias: firstColAlias,
                endColAlias: 'MAX',
                activeRowAlias: rowAlias
            })
            this.firstRowAlias = rowAlias
        },
        dragState(e) {
            let rowPosi = this.getRelativePosi(e.clientY)
            let rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi)
            let rows = this.$store.getters.allRows
            let rowAlias = rows[rowIndex].alias
            let firstColAlias = this.$store.getters.visibleColList()[0].alias
            this.$store.dispatch(SELECTS_CHANGE, {
                activeRowAlias: this.firstRowAlias,
                endRowAlias: rowAlias,
                activeColAlias: firstColAlias,
                endColAlias: 'MAX',
            })
        },
    },
    mounted() {
        this.currentMouseMoveState = this.routineMoveState
        this.$watch('mouseState', function(newVal, oldVal) {
            if (newVal === DRAG) {
                this.currentMouseMoveState = this.dragState
            }
            if (newVal === LOCATE) {
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
