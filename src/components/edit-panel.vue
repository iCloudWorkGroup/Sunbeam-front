<template>
	<div class="edit-panel" ref="panel" @mousedown="locate" :style="{width: width + 'px', height: height + 'px'}">	
		<row-group></row-group>
		<col-group></col-group>
		<cell-group></cell-group>
		<select-group></select-group>
		<input-box></input-box>
	</div>
</template>
<script type="text/javascript">
	import {SELECTS_UPDATESELECT} from '../store/action-types';
	import ColGroup from './col-group.vue';
	import RowGroup from './row-group.vue';
	import CellGroup from './cell-group.vue';
	import SelectGroup from './select-group.vue';
	import InputBox from './input-box.vue';

	export default {
		props: ['editPanelWidth', 'editPanelHeight'],
		computed: {
			width() {
				let colList = this.$store.getters.colList,
					lastCol = colList[colList.length - 1];
				return lastCol.left + lastCol.width;
			},
			height() {
				let rowList = this.$store.getters.rowList,
					lastRow = rowList[rowList.length - 1];
				return lastRow.top + lastRow.height;
			}
		},
		components: {
			ColGroup,
			RowGroup,
			CellGroup,
			SelectGroup,
			InputBox
		},
		methods: {
			locate(e) {
				let elem = this.$refs.panel,
					box;

				box = elem.getBoundingClientRect();
				this.changeSelect(e.clientX - box.left, e.clientY - box.top);
			},
			changeSelect(X, Y) {
				let colIndex = this.$store.getters.getColIndex(X),
					rowIndex = this.$store.getters.getRowIndex(Y);

				this.$store.dispatch(SELECTS_UPDATESELECT, {
					startColIndex: colIndex,
					startRowIndex: rowIndex,
					type: 'locate'
				});
			}
		}
	};
</script>
<style type="text/css">
	.edit-panel {
		position: relative;
	}
</style>