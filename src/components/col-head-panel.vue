<template>
    <div class="col-head-panel"
         ref="panel"
         @dblclick="dbclickHandle"
         @mousedown="mouseDownHandle"
         @mousemove="mouseMoveHandle">
        <col-head-item
            v-for="col in viewCols"
            :key="col.alias"
            :col="col"
            :offsetLeft="offsetLeft"/>
        <col-head-item
            v-if="adjustState"
            ref="adjustColView"
            class="adjust-col-head-item"
            :offsetLeft="offsetLeft"
            :col="adjustCol"/>
        <div v-if="adjustState"
             ref="adjustPanelView"
             class="temp-space-container">
            <col-head-item
                v-for="col in adjustCols"
               :key="col.alias"
               :col="col"
               :offsetLeft="offsetLeft"/>
        </div>
    </div>
</template>
<script>
import ColHeadItem from './col-head-item.vue'
import {
    SELECTS_CHANGE,
    COLS_ADJUSTWIDTH
} from '../store/action-types'
// import {
//     UPDATE_MOUSESTATE
// } from '../store/mutation-types'
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
            adjustColIndex: '',
            firstColAlias: ''
        }
    },
    computed: {
        viewCols() {
            return this.$store.getters.colsByRange(this.start, this.over)
        },
        adjustCols() {
            let cols = this.$store.getters.allCols
            return cols.slice(this.adjustColIndex + 1)
        },
        mouseState() {
            return this.$store.state.selects.mouseState
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
        dbclickHandle(e) {
            this.currentDbclickState(e)
        },
        currentMouseDownState(e) {
            this.locateState(e)
        },
        currentMouseMoveState(e) {
            this.routineMoveState(e)
        },
        currentDbclickState(e) {
            this.inputWidth(e)
        },
        inputWidth(e) {
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: true,
                title: '设置列宽',
                type: 'width',
            })
            this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
            let selects = this.$store.state.selects.list
            let destroyDataSource = {}
            selects.forEach((item, index) => {
                if (item.type === 'DATASOURCE') {
                    destroyDataSource = item
                }
            })
            this.$store.dispatch('SELECTS_DELETE', {
                select: destroyDataSource
            })
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
            if (col.left + col.width - posi < 3) {
                panel.style.cursor = 'col-resize'
                this.adjustColIndex = colIndex
                this.adjustCol = cols[colIndex]
                this.currentMouseDownState = this.startAdjustHandleState
                this.currentDbclickState = {}
            } else if (posi - col.left < 3 && colIndex !== 0) {
                if (cols[colIndex - 1].hidden) {
                    return
                }
                panel.style.cursor = 'col-resize'
                this.adjustColIndex = colIndex - 1
                this.adjustCol = cols[colIndex - 1]
                this.currentMouseDownState = this.startAdjustHandleState
                this.currentDbclickState = {}
            } else {
                panel.style.cursor = 'pointer'
                this.currentMouseDownState = this.locateState
                this.currentDbclickState = this.inputWidth
            }
        },

        startAdjustHandleState(e) {
            this.$store.commit('SWITCH_NAME', '')
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            let adjustHandle
            let self = this

            this.$store.commit('M_SELECT_UPDATE_MOUSESTATUS', 'LOCATE')
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
        },
        locateState(e) {
            let popup = this.$store.state.sheets.popup
            if (popup.type === 'height') {
                this.$store.commit('UPDATE_SHEET_POPUP', {
                    show: popup.show,
                    title: '设置列宽',
                    type: 'width',
                })
            }
            this.$store.commit('M_SELECT_UPDATE_MOUSESTATUS', 'DRAG')
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)
            let colAlias = this.$store.getters.allCols[colIndex].alias
            let firstRowAlias = this.$store.getters.allRows[0].alias
            this.$store.dispatch(SELECTS_CHANGE, {
                activeRowAlias: firstRowAlias,
                endRowAlias: 'MAX',
                activeColAlias: colAlias
            })
            this.firstColAlias = colAlias
        },
        dragState(e) {
            let colPosi = this.getRelativePosi(e.clientX)
            let colIndex = this.$store.getters.getColIndexByPosi(colPosi)
            let cols = this.$store.getters.allCols
            let colAlias = cols[colIndex].alias
            let firstRowAlias = this.$store.getters.visibleRowList()[0].alias
            this.$store.dispatch(SELECTS_CHANGE, {
                activeRowAlias: firstRowAlias,
                endRowAlias: 'MAX',
                activeColAlias: this.firstColAlias,
                endColAlias: colAlias,
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
    .adjust-col-head-item{
        transition: 0s
    }
</style>