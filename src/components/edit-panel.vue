<template>
	<div class="edit-panel" ref="panel" @mousedown="locate" :style="{width: width, height: height}">	
		<row-grid-group :frozenRule="frozenRule"></row-grid-group>
		<col-grid-group :frozenRule="frozenRule"></col-grid-group>
		<cell-group :frozenRule="frozenRule"></cell-group>
		<select-group :frozenRule="frozenRule"></select-group>
	</div>
</template>
<script type="text/javascript">
	import {SELECTS_UPDATESELECT} from '../store/action-types';
	import ColGridGroup from './col-grid-group.vue';
	import RowGridGroup from './row-grid-group.vue';
	import CellGroup from './cell-group.vue';
	import SelectGroup from './select-group.vue';
	import InputBox from './input-box.vue';

	export default {
		props: ['editPanelWidth', 'editPanelHeight', 'frozenRule'],
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
					startRowIndex = frozenRule ? frozenRule.startRowIndex: 0,
					endRowIndex,
					lastRow;


				endRowIndex = frozenRule && frozenRule.endRowIndex !== undefined ?
					frozenRule.endRowIndex : rowList.length - 1;
				lastRow = rowList[endRowIndex];

				return lastRow.top + lastRow.height - rowList[startRowIndex].top + 'px';

			}
		},
		components: {
			ColGridGroup,
			RowGridGroup,
			CellGroup,
			SelectGroup,
			InputBox
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
			this.changeSelect(e.clientX - box.left + offsetLeft,
				e.clientY - box.top + offsetTop);
        },
        changeSelect(X, Y) {
            let colIndex = this.$store.getters.getColIndexByPosi(X),
                rowIndex = this.$store.getters.getRowIndexByPosi(Y);

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