<template>
    <div class="col-head-panel" ref="panel" @mousedown="mouseDownHandle" @mousemove="mouseMoveHandle">
        <col-head-item v-for="col in colList" :key="col.alias" :col="col" :offsetLeft="offsetLeft"></col-head-item>
    </div>
</template>
<script type="text/javascript">
import colHeadItem from './col-head-item.vue';
import { SELECTS_UPDATESELECT } from '../store/action-types';
import { UPDATE_MOUSESTATE } from '../store/mutation-types';
import { LOCATE, DRAG } from '../tools/basic';

export default {
    props: ['frozenRule'],
    data() {
        let startIndex,
            endIndex;
        if (this.frozenRule) {
            startIndex = this.frozenRule.startColIndex;
            endIndex = this.frozenRule.endColIndex;
        }
        return {
            startIndex,
            endIndex
        }
    },
    components: {
        'col-head-item': colHeadItem
    },
    computed: {
        offsetLeft() {
            if (this.frozenRule) {
                return this.frozenRule.offsetLeft;
            } else {
                return 0;
            }
        },
        colList() {
            let getters = this.$store.getters,
                colList = getters.colList,
                startIndex,
                endIndex,
                lastCol;

            startIndex = this.startIndex || 0;
            endIndex = this.endIndex || colList.length - 1;
            if (this.endIndex !== undefined) {
                return colList.slice(startIndex, endIndex + 1);
            } else {
                return getters.userViewColList;
            }
        },
        mouseState() {
            return this.$store.state.mouseState;
        }
    },
    methods: {
        mouseDownHandle(e) {
            let elem = this.$refs.panel,
                frozenRule = this.frozenRule,
                offsetLeft = this.offsetLeft,
                box;

            box = elem.getBoundingClientRect();

            let colPosi = e.clientX - box.left + offsetLeft,
                colIndex = this.$store.getters.getColIndexByPosi(colPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
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
        routineMoveState() {

        },
        dragState(e) {
            let elem = this.$refs.panel,
                frozenRule = this.frozenRule,
                offsetLeft = 0,
                box;

            if (frozenRule) {
                offsetLeft = frozenRule.offsetLeft;
            }
            box = elem.getBoundingClientRect();

            let colPosi = e.clientX - box.left + offsetLeft,
                colIndex = this.$store.getters.getColIndexByPosi(colPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
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
</style>