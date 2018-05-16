
<template>
    <div class="edit-panel" ref="panel" @mousedown="locate" @mousemove="mouseMoveHandle"
        :style="{width: width, height: height}">
        <row-grid-group :frozenRule="frozenRule"></row-grid-group>
        <col-grid-group :frozenRule="frozenRule"></col-grid-group>
        <cell-group :frozenRule="frozenRule"></cell-group>
        <select-group :frozenRule="frozenRule"></select-group>
    </div>
</template>
<script type="text/javascript">
import { SELECTS_UPDATESELECT } from '../store/action-types';
import { UPDATE_MOUSESTATE } from '../store/mutation-types';
import ColGridGroup from './col-grid-group.vue';
import RowGridGroup from './row-grid-group.vue';
import CellGroup from './cell-group.vue';
import SelectGroup from './select-group.vue';
import { LOCATE, DRAG } from '../tools/constant';
export default {
    props: ['editPanelWidth', 'editPanelHeight', 'frozenRule'],
    components: {
        ColGridGroup,
        RowGridGroup,
        CellGroup,
        SelectGroup
    },
    computed: {
        width() {
            let cols = this.$store.getters.colList,
                visibleCols = this.$store.getters.visibleColList,
                frozenRule = this.frozenRule,
                startColIndex,
                endColIndex,
                lastCol,
                startCol;

            if (frozenRule) {
                startColIndex = frozenRule.startColIndex;
                if (frozenRule.endColIndex !== undefined) {
                    endColIndex = frozenRule.endColIndex;
                }else{
                    endColIndex = cols.length -1;
                }
                startCol = cols[startColIndex];
                lastCol = cols[endColIndex];
            } else {
                endColIndex = visibleCols.length - 1;
                startCol = visibleCols[0];
                lastCol = visibleCols[endColIndex];
            }
            return lastCol.left + lastCol.width - startCol.left + 'px';
        },
        height() {
            let rows = this.$store.getters.rowList,
                visibleRows = this.$store.getters.visibleRowList,
                frozenRule = this.frozenRule,
                startRowIndex,
                endRowIndex,
                lastRow,
                startRow;

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex;
                if (frozenRule.endRowIndex !== undefined) {
                    endRowIndex = frozenRule.endRowIndex;
                }else {
                    endRowIndex = rows.length - 1;
                }
                startRow = rows[startRowIndex];
                lastRow = rows[endRowIndex];
            } else {
                endRowIndex = visibleRows.length - 1;
                startRow = visibleRows[0];
                lastRow = visibleRows[endRowIndex];
            }
            return lastRow.top + lastRow.height - startRow.top + 'px';
        },
        mouseState() {
            return this.$store.state.mouseState;
        }
    },
    methods: {
        locate(e){
            let getters = this.$store.getters,
                elem = this.$refs.panel,
                frozenRule = this.frozenRule,
                offsetLeft = 0,
                offsetTop = 0,
                box;

            if (frozenRule) {
                offsetLeft = frozenRule.offsetLeft;
                offsetTop = frozenRule.offsetTop;
            }
            box = elem.getBoundingClientRect();

            let colPosi = e.clientX - box.left + offsetLeft,
                rowPosi = e.clientY - box.top + offsetTop,
                colIndex = getters.getColIndexByPosi(colPosi),
                rowIndex = getters.getRowIndexByPosi(rowPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex
            });
            this.$store.commit(UPDATE_MOUSESTATE, {
                state: DRAG
            });
        },
        mouseMoveHandle(e) {
            this.currentMouseMoveState(e);
        },
        currentMouseMoveState() {

        },
        routineMoveState(e) {

        },
        dragState(e) {
            let elem = this.$refs.panel,
                frozenRule = this.frozenRule,
                offsetLeft = 0,
                offsetTop = 0,
                box;

            if (frozenRule) {
                offsetLeft = frozenRule.offsetLeft;
                offsetTop = frozenRule.offsetTop;
            }
            box = elem.getBoundingClientRect();

            let colPosi = e.clientX - box.left + offsetLeft,
                rowPosi = e.clientY - box.top + offsetTop,
                colIndex = this.$store.getters.getColIndexByPosi(colPosi),
                rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex
            });
        }
    },
    mounted() {
        this.currentMouseMoveState = this.routineMoveState;
        this.$watch('mouseState', function(val) {
            if (val === DRAG) {
                this.currentMouseMoveState = this.dragState;
            }
            if (val === LOCATE) {
                this.currentMouseMoveState = this.routineMoveState;
            }
        });
    }
};
</script>
<style type="text/css">
.edit-panel {
    position: relative;
}
</style>