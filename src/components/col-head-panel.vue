<template>
<div class="col-head-panel"
     ref="panel"
     @mousedown="mouseDownHandle"
     @mousemove="mouseMoveHandle">
    <col-head-item v-for="col in colList"
                   :key="col.alias"
                   :col="col"
                   :offsetLeft="offsetLeft">
    </col-head-item>
    <col-head-item v-if="adjustState"
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
    SELECTS_UPDATESELECT,
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
    props: ['frozenRule'],
    data() {
        let startIndex
        let endIndex
        if (this.frozenRule) {
            startIndex = this.frozenRule.startColIndex
            endIndex = this.frozenRule.endColIndex
        }
        return {
            startIndex,
            endIndex,
            adjustState: false,
            adjustCol: null,
            adjustColIndex: null
        }
    },
    components: {
        ColHeadItem
    },
    computed: {
        offsetLeft() {
            if (this.frozenRule) {
                return this.frozenRule.offsetLeft
            } else {
                return 0
            }
        },
        colList() {
            let getters = this.$store.getters
            let cols = getters.colList
            let visibleCols = getters.visibleColList
            let frozenRule = this.frozenRule
            let startColIndex
            let endColIndex
            let lastCol
            let startCol

            if (frozenRule) {
                startColIndex = frozenRule.startColIndex
                if (frozenRule.endColIndex != null) {
                    endColIndex = frozenRule.endColIndex
                } else {
                    endColIndex = visibleCols.length - 1
                }
                startCol = cols[startColIndex]
                lastCol = cols[endColIndex]
                startColIndex = getters.getVisibleColIndexBySort(startCol.sort)
                endColIndex = getters.getVisibleColIndexBySort(lastCol.sort)
                return getters.visibleColList.slice(startColIndex, endColIndex +
                    1)
            } else {
                return getters.userViewColList
            }
        },
        adjustColList() {
            let colList = this.$store.getters.colList
            return colList.slice(this.adjustColIndex + 1)
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
            console.log('empty function')
        },
        currentMouseMoveState(e) {
            console.log('empty function')
        },
        locateState(e) {
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
            })
            this.$store.commit(UPDATE_MOUSESTATE, {
                state: DRAG
            })
        },
        startAdjustHandleState(e) {
            let posi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(posi)
            let cols = this.$store.getters.colList
            let adjustHandle
            let self = this

            this.adjustColIndex = colIndex
            this.adjustCol = cols[colIndex]
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
            let panel = this.$refs.panel

            if (col.left + col.width - posi < 5) {
                panel.style.cursor = 'col-resize'
                this.currentMouseDownState = this.startAdjustHandleState
            } else {
                panel.style.cursor = 'pointer'
                this.currentMouseDownState = this.locateState
            }
        },
        dragState(e) {
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
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