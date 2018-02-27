<template>
	<div class="edit-panel" @mousedown="locate" :style="{width: width + 'px', height: height + 'px'}">	
		<row-group></row-group>
		<col-group></col-group>
		<cell-group></cell-group>
		<select-group></select-group>
	</div>
</template>
<script type="text/javascript">
	import {SELECTS_UPDATESELECT} from '../../store/action-types';
	import ColGroup from '../colgroup/colgroup.vue';
	import RowGroup from '../rowgroup/rowgroup.vue';
	import CellGroup from '../cellgroup/cellgroup.vue';
	import SelectGroup from '../selectgroup/selectgroup.vue';

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
			'col-group': ColGroup,
			'row-group': RowGroup,
			'cell-group': CellGroup,
			'select-group': SelectGroup
		},
		methods: {
			locate(e) {
				this.changeSelect(e.offsetX, e.offsetY);
			},
			changeSelect(offsetX, offsetY) {
				let colIndex = this.$store.getters.getColIndex(offsetX),
					rowIndex = this.$store.getters.getRowIndex(offsetY);

				this.$store.dispatch(SELECTS_UPDATESELECT, {
					startColIndex:colIndex,
					startRowIndex:rowIndex
				}, 'locate');
			}
		}
	};
</script>
<style type="text/css">
	.edit-panel {
		position: relative;
	}
</style>