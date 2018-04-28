<template>
    <div class="col-head-panel" ref="panel" @mousedown="mouseDownHandle" @mousemove="mouseMoveHandle">
        <col-head-item v-for="col in colList" 
            :key="col.alias" :col="col" 
            :offsetLeft="offsetLeft">
        </col-head-item>
        <col-head-item v-if="adjustState" ref="adjustColView" 
            class= "adjust-col-head-item"
            :offsetLeft="offsetLeft"  
            :col="adjustCol" >
        </col-head-item>
        <div v-if="adjustState" ref="adjustPanelView" class="temp-space-container">
            <col-head-item v-for="col in adjustColList" 
            :key="col.alias" :col="col" 
            :offsetLeft="offsetLeft">
            </col-head-item>
        </div>
    </div>
</template>
<script type="text/javascript">
import ColHeadItem from './col-head-item.vue';
import { SELECTS_UPDATESELECT, COLS_ADJUSTWIDTH } from '../store/action-types';
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
                return this.frozenRule.offsetLeft;
            } else {
                return 0;
            }
        },
        colList() {
            let getters = this.$store.getters,
                cols = getters.colList,
                visibleCols = getters.visibleColList,
                frozenRule = this.frozenRule,
                startColIndex,
                endColIndex,
                lastCol,
                startCol;

            if (frozenRule) {
                startColIndex = frozenRule.startColIndex;
                if (frozenRule.endColIndex !== undefined) {
                    endColIndex = frozenRule.endColIndex;
                }
                startCol = cols[startColIndex];
                lastCol = cols[endColIndex];
                startColIndex = getVisibleColIndexBySort(startCol.sort);
                endColIndex = getVisibleColIndexBySort(lastCol.sort);
                return getters.visibleCols.slice(startIndex, endIndex + 1);
            } else {
                return getters.userViewColList;
            }
        },
        adjustColList() {
            let colList = this.$store.getters.colList;
            return colList.slice(this.adjustColIndex + 1);
        },
        mouseState() {
            return this.$store.state.mouseState;
        }
    },
    methods: {
        getRelativePosi(posi){
            let elem = this.$refs.panel,
                box = elem.getBoundingClientRect(),
                offsetLeft = this.offsetLeft;
            return posi - box.left + offsetLeft;
        },
        mouseDownHandle(e) {
            this.currentMouseDownState(e);
        },
        mouseMoveHandle(e) {
            this.currentMouseMoveState(e);
        },
        currentMouseDownState(e){
        },
        currentMouseMoveState(e) {
        },
        locateState(e){
            let colPosi = this.getRelativePosi(e.clientX),
                colIndex = this.$store.getters.getColIndexByPosi(colPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
            });
            this.$store.commit(UPDATE_MOUSESTATE, {
                state: DRAG
            });
        },
        startAdjustHandleState(e) {
            let posi = this.getRelativePosi(e.clientX),
                colIndex = this.$store.getters.getColIndexByPosi(posi),
                cols = this.$store.getters.colList,
                adjustHandle,
                self = this;

            this.adjustColIndex = colIndex;
            this.adjustCol = cols[colIndex];
            this.adjustState = true;

            if (!(adjustHandle = this.adjustHandle)) {
                
                adjustHandle = this.adjustHandle = function(e) {
                    self.adjustHandleState.call(self, e);
                }
            }

            document.addEventListener('mousemove', adjustHandle, false);
            this.currentMouseMoveState = function() {};

            function stopAdjustHandle(e){
                document.removeEventListener('mousemove', adjustHandle);
                document.removeEventListener('mouseup', stopAdjustHandle);
                self.changeColWidth(e);
            }
            document.addEventListener('mouseup', stopAdjustHandle);
        },
        routineMoveState(e) {
            if(this.adjustState){
                return;
            }
            let posi = this.getRelativePosi(e.clientX),
                col = this.$store.getters.getColByPosi(posi),
                panel = this.$refs.panel;

            if (col.left + col.width - posi < 5) {
                panel.style.cursor = 'col-resize';
                this.currentMouseDownState = this.startAdjustHandleState;
            } else {
                panel.style.cursor = 'pointer';
                this.currentMouseDownState = this.locateState;
            }
        },
        dragState(e) {
            let colPosi = this.getRelativePosi(e.clientX),
                colIndex = this.$store.getters.getColIndexByPosi(colPosi);

            this.$store.dispatch(SELECTS_UPDATESELECT, {
                colIndex,
                rowIndex: 'MAX'
            });
        },
        adjustHandleState(e){
            let colView = this.$refs.adjustColView.$el,
                panelView = this.$refs.adjustPanelView,
                posi = this.getRelativePosi(e.clientX),
                col = this.adjustCol,
                temp;

            if ((temp = posi- col.left) > 5) {
                colView.style.width = temp + 'px';
                panelView.style.left = temp - col.width + 'px';
            }
        },
        changeColWidth(){
            this.adjustState = false;
            this.currentMouseMoveState = this.routineMoveState;

            let width = this.$refs.adjustColView.$el.style.width;
            
            width = parseInt(width.substring(0, width.length - 2));
            this.$store.dispatch(COLS_ADJUSTWIDTH, {
                width,
                index: this.adjustColIndex
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
    .adjust-col-head-item{
        transition: 0s
    }
</style>