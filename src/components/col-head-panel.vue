<template>
    <div class="col-head-panel"
         ref="panel"
         @mousedown="mouseDownHandle"
         @mousemove="mouseMoveHandle">
        <col-head-item
                v-for="col in viewCols"
                :key="col.alias"
                :col="col"
                :offsetLeft="offsetLeft"/>
        <col-head-item  v-if="adjustState"
                        ref="adjustColView"
                        class="adjust-col-head-item"
                        :offsetLeft="offsetLeft"
                        :col="adjustCol">
        </col-head-item>
        <div v-if="adjustState"
             ref="adjustPanelView"
             class="temp-space-container">
            <col-head-item v-for="col in adjustColList"
                           :key="col.alias"
                           :col="col"
                           :offsetLeft="offsetLeft">
            </col-head-item>
        </div>
    </div>
</template>
<script>
import ColHeadItem from './col-head-item.vue'
import {
    SELECTS_CHANGE,
    COLS_ADJUSTWIDTH
} from '../store/action-types'
import {
    UPDATE_MOUSESTATE
} from '../store/mutation-types'
import {
    LOCATE,
    DRAG
} from '../tools/constant'

export default {
    props: ['start', 'over', 'offsetLeft'],
    components: {
        ColHeadItem
    },
    data() {
        return {
            adjustState: false,
            adjustCol: '',
            adjustColIndex: ''
        }
    },
    computed: {
        viewCols() {
            return this.$store.getters.colsByRange(this.start, this.over)
        },
        adjustColList() {
            let cols = this.$store.getters.allCols
            return cols.slice(this.adjustColIndex + 1)
        },
        mouseState() {
            return this.$store.state.mouseState
        }
    },
    methods: {
        getRelativePosi(posi) {
            let elem = this.$refs.panel
            let box = elem.getBoundingClientRect()
            let offsetLeft = this.offsetLeft
            return posi - box.left + offsetLeft
        },
        mouseDownHandle(e) {
            this.currentMouseDownState(e)
        },
        mouseMoveHandle(e) {
            this.currentMouseMoveState(e)
        },
        currentMouseDownState(e) {
            this.locateState(e)
        },
        currentMouseMoveState(e) {
            this.routineMoveState(e)
        },
        locateState(e) {
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)

            this.$store.dispatch(SELECTS_CHANGE, {
                startColIndex: colIndex,
                startRowIndex: 'MAX'
            })
            this.$store.commit(UPDATE_MOUSESTATE, {
                state: DRAG
            })
        },
        startAdjustHandleState(e) {
            let adjustHandle
            let self = this

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
                self.changeColWidth(e)
            }
            document.addEventListener('mouseup', stopAdjustHandle)
        },
        routineMoveState(e) {
            if (this.adjustState) {
                return
            }
            let posi = this.getRelativePosi(e.clientX)
            let col = this.$store.getters.getColByPosi(posi)
            let cols = this.$store.getters.allCols
            let colIndex = this.$store.getters.getColIndexByPosi(posi)
            let panel = this.$refs.panel
            if (col.left + col.width - posi < 5) {
                panel.style.cursor = 'col-resize'
                this.adjustColIndex = colIndex
                this.adjustCol = cols[colIndex]
                this.currentMouseDownState = this.startAdjustHandleState
            } else if (posi - col.left < 5 && colIndex !== 0) {
                if (cols[colIndex - 1].hidden) {
                    return
                }
                panel.style.cursor = 'col-resize'
                this.adjustColIndex = colIndex - 1
                this.adjustCol = cols[colIndex - 1]
                this.currentMouseDownState = this.startAdjustHandleState
            } else {
                panel.style.cursor = 'pointer'
                // this.currentMouseDownState = this.locateState
                this.currentMouseDownState = function () {}
            }
        },
        dragState(e) {
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)

            this.$store.dispatch(SELECTS_CHANGE, {
                startColIndex: colIndex,
                startRowIndex: 'MAX'
            })
        },
        adjustHandleState(e) {
            let colView = this.$refs.adjustColView.$el
            let panelView = this.$refs.adjustPanelView
            let posi = this.getRelativePosi(e.clientX)
            let col = this.adjustCol
            let temp

            if ((temp = posi - col.left) > 5) {
                colView.style.width = temp + 'px'
                panelView.style.left = temp - col.width + 'px'
            }
        },
        changeColWidth() {
            this.adjustState = false
            this.currentMouseMoveState = this.routineMoveState

            let width = this.$refs.adjustColView.$el.style.width

            width = parseInt(width.substring(0, width.length - 2), 10)
            this.$store.dispatch(COLS_ADJUSTWIDTH, {
                width,
                index: this.adjustColIndex
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
    .adjust-col-head-item{
        transition: 0s
    }
</style>