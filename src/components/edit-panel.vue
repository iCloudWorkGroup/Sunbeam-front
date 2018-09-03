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
// import cache from '../tools/cache'
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
            return this.$store.getters.selectState
        }
    },
    methods: {
        locateSelect(downEvent) {
            let getters = this.$store.getters
            let el = downEvent.currentTarget
            let clientRect = el.getBoundingClientRect()
            let col = getters.getColByPosi(downEvent.clientX - clientRect.left + this.offsetLeft)
            let row = getters.getRowByPosi(downEvent.clientY - clientRect.top + this.offsetTop)
            if (this.selectState === 'dateSource' && this.$store.state.selects.list.length < 2) {
                this.$store.dispatch(SELECTS_INSERT, {
                    colAlias: col.alias,
                    rowAlias: row.alias
                })
            }
            this.$store.dispatch(SELECTS_CHANGE, {
                activeColAlias: col.alias,
                activeRowAlias: row.alias
            })

            // 拖动选择区域事件
            let bindSelectChange = selectChange.bind(this)
            document.addEventListener('mousemove', bindSelectChange)
            // cache.eventList.set(el, {
            //     'mousemove': {
            //         [bindSelectChange]: true
            //     }
            // })
            document.addEventListener('mouseup', function() {
                // let elEvents = cache.eventList.get(el)
                // if (elEvents != null &&
                //     elEvents['mousemove'] != null &&
                //     elEvents['mousemove'][bindSelectChange]) {
                document.removeEventListener('mousemove', bindSelectChange)
                // cache.eventList.delete(el)
                // }
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
                // if (window.ss.handlers['regionChange']) {
                //     for (let i = 0; i < window.ss.handlers['regionChange'].length; i++) {
                //         let selects = this.$store.state.selects.list
                //         let select
                //         let state = this.selectState === 'select' ? 'SELECT' : 'DATESOURCE'
                //         selects.forEach((item, index) => {
                //             if (item.type === state) {
                //                 select = item
                //             }
                //         })
                //         let startCol = this.$store.getters.getColByAlias(select.wholePosi.startColAlias).displayName
                //         let endCol = this.$store.getters.getColByAlias(select.wholePosi.endColAlias).displayName
                //         let startRow = this.$store.getters.getRowByAlias(select.wholePosi.startRowAlias).displayName
                //         let endRow = this.$store.getters.getRowByAlias(select.wholePosi.endRowAlias).displayName
                //         window.ss.handlers['regionChange'][i].apply(this, [{
                //             point: {
                //                 startCol: startCol,
                //                 endCol: endCol,
                //                 startRow: startRow,
                //                 endRow: endRow
                //             }
                //         }])
                //     }
                // }
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
