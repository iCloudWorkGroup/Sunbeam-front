<template>
	<div class="edit-panel" ref="panel" @mousedown="locate" @mousemove="mouseMoveHandle" :style="{width: width, height: height}">	
		<row-grid-group :frozenRule="frozenRule"></row-grid-group>
		<col-grid-group :frozenRule="frozenRule"></col-grid-group>
		<cell-group :frozenRule="frozenRule"></cell-group>
		<select-group :frozenRule="frozenRule"></select-group>
	</div>
</template>
<script type="text/javascript">
	import {SELECTS_UPDATESELECT} from '../store/action-types';
	import {UPDATE_MOUSESTATE} from '../store/mutation-types';
	import ColGridGroup from './col-grid-group.vue';
	import RowGridGroup from './row-grid-group.vue';
	import CellGroup from './cell-group.vue';
	import SelectGroup from './select-group.vue';
	import {LOCATE, DRAG} from '../tools/basic';
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
				let colList = this.$store.getters.colList,
					frozenRule = this.frozenRule,
					startColIndex = frozenRule ? frozenRule.startColIndex : 0,
					endColIndex,
					lastCol;

				endColIndex = frozenRule && frozenRule.endColIndex !== undefined ?
					frozenRule.endColIndex : colList.length - 1;
				lastCol = colList[endColIndex];

				return lastCol.left + lastCol.width - colList[startColIndex].left + 'px';
			},
			height() {
				let rowList = this.$store.getters.rowList,
					frozenRule = this.frozenRule,
					startRowIndex = frozenRule ? frozenRule.startRowIndex : 0,
					endRowIndex,
					lastRow;

				endRowIndex = frozenRule && frozenRule.endRowIndex !== undefined ?
					frozenRule.endRowIndex : rowList.length - 1;
				lastRow = rowList[endRowIndex];

				return lastRow.top + lastRow.height - rowList[startRowIndex].top + 'px';
			},
			mouseState(){
				return this.$store.state.mouseState;
			},
			colListLen(){
				return this.$store.getters.colList.length;
			},
			rowListLen(){
				return this.$store.getters.rowList.length;
			}
		},
		methods: {
			locate(e) {
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
		mounted(){
			this.currentMouseMoveState = this.routineMoveState;
			
			this.$watch('mouseState', function(val){
				if(val === DRAG){
					this.currentMouseMoveState = this.dragState;
				}
				if(val === LOCATE){
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