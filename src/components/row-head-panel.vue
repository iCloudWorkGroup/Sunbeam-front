<template>
	<div class="row-head-panel" ref="panel" @mousedown="mouseDownHandle" @mousemove="mouseMoveHandle">
		<row-head-item v-for="row in rowList" 
			:key="row.alias" :row="row" 
			:offsetTop="offsetTop">
		</row-head-item>
		<row-head-item v-if="adjustState" ref="adjustRowView" 
			class= "adjust-row-head-item"
			:offsetTop="offsetTop"  
			:row="adjustRow" >
		</row-head-item>
		<div v-if="adjustState" ref="adjustPanelView" class="temp-space-container">
			<row-head-item v-for="row in adjustRowList" 
			:key="row.alias" :row="row" 
			:offsetTop="offsetTop">
			</row-head-item>
		</div>
	</div>
</template>

<script type="text/javascript">
import RowHeadItem from './row-head-item.vue';
import {SELECTS_UPDATESELECT, ROWS_ADJUSTHEIGHT} from '../store/action-types';
import {UPDATE_MOUSESTATE} from '../store/mutation-types';
import {LOCATE, DRAG} from '../tools/constant';

export default {
	props: ['frozenRule'],
	data() {
		let startIndex,
			endIndex;
		if (this.frozenRule) {
			startIndex = this.frozenRule.startRowIndex;
			endIndex = this.frozenRule.endRowIndex;
		}

		return {
			startIndex,
			endIndex,
			adjustState: false,
			adjustRow: null,
			adjustRowIndex: null
		}
	},
	components: {
		RowHeadItem
	},
	computed: {
		offsetTop() {
			if (this.frozenRule) {
				return this.frozenRule.offsetTop;
			} else {
				return 0;
			}
		},
		rowList() {
            let getters = this.$store.getters,
                rows = getters.rowList,
                visibleRows = getters.visibleRowList,
                frozenRule = this.frozenRule,
                startRowIndex,
                endRowIndex,
                lastRow,
                startRow;

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex;
                if (frozenRule.endRowIndex !== undefined) {
                    endRowIndex = frozenRule.endRowIndex;
                }else{
                	endRowIndex = visibleRows.length - 1;
                }
                startRow = rows[startRowIndex];
                lastRow = rows[endRowIndex];
                startRowIndex = getters.getVisibleRowIndexBySort(startRow.sort);
                endRowIndex = getters.getVisibleRowIndexBySort(lastRow.sort);
                return visibleRows.slice(startRowIndex, endRowIndex + 1);
            } else {
                return getters.userViewRowList;
            }
		},
		adjustRowList() {
			let rowList = this.$store.getters.rowList;
			return rowList.slice(this.adjustRowIndex + 1);
		},
		mouseState() {
			return this.$store.state.mouseState;
		}
	},
	methods: {
		getRelativePosi(posi) {
			let elem = this.$refs.panel,
				box = elem.getBoundingClientRect(),
				offsetTop = this.offsetTop;
			return posi - box.top + offsetTop;
		},
		mouseDownHandle(e) {
			this.currentMouseDownState(e);
		},
		mouseMoveHandle(e) {
			this.currentMouseMoveState(e);
		},
		currentMouseMoveState(e) {

		},
		currentMouseDownState(e) {

		},
		locateState(e) {
			let rowPosi = this.getRelativePosi(e.clientY),
				rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi);

			this.$store.dispatch(SELECTS_UPDATESELECT, {
				colIndex: 'MAX',
				rowIndex
			});
			this.$store.commit(UPDATE_MOUSESTATE, {
				state: DRAG
			});
		},
		startAdjustHandleState(e) {
			let posi = this.getRelativePosi(e.clientY),
				rowIndex = this.$store.getters.getRowIndexByPosi(posi),
				rows = this.$store.getters.rowList,
				adjustHandle,
				self = this;

			this.adjustRowIndex = rowIndex;
			this.adjustRow = rows[rowIndex];
			this.adjustState = true;

			if (!(adjustHandle = this.adjustHandle)) {

				adjustHandle = this.adjustHandle = function(e) {
					self.adjustHandleState.call(self, e);
				}
			}

			document.addEventListener('mousemove', adjustHandle, false);
			this.currentMouseMoveState = function() {};

			function stopAdjustHandle(e) {
				document.removeEventListener('mousemove', adjustHandle);
				document.removeEventListener('mouseup', stopAdjustHandle);
				self.changeRowHeight(e);
			}
			document.addEventListener('mouseup', stopAdjustHandle);
		},

		routineMoveState(e) {
			if (this.adjustState) {
				return;
			}

			let posi = this.getRelativePosi(e.clientY),
				row = this.$store.getters.getRowByPosi(posi),
				panel = this.$refs.panel;

			if (row.height + row.top - posi < 5) {
				panel.style.cursor = 'row-resize';
				this.currentMouseDownState = this.startAdjustHandleState;
			} else {
				panel.style.cursor = 'pointer';
				this.currentMouseDownState = this.locateState;
			}
		},
		dragState(e) {
			let rowPosi = this.getRelativePosi(e.clientY),
				rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi);

			this.$store.dispatch(SELECTS_UPDATESELECT, {
				colIndex: 'MAX',
				rowIndex
			});
		},
		adjustHandleState(e) {
			let rowView = this.$refs.adjustRowView.$el,
				panelView = this.$refs.adjustPanelView,
				posi = this.getRelativePosi(e.clientY),
				row = this.adjustRow,
				temp;

			if ((temp = posi - row.top) > 5) {
				rowView.style.height = temp + 'px';
				panelView.style.top = temp - row.height + 'px';
			}
		},
		changeRowHeight() {
			this.adjustState = false;
			this.currentMouseMoveState = this.routineMoveState;
			let height = this.$refs.adjustRowView.$el.style.height;
			height = parseInt(height.substring(0, height.length - 2));
			
			this.$store.dispatch(ROWS_ADJUSTHEIGHT, {
				height,
				index: this.adjustRowIndex
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
	.adjust-row-head-item{
		transition: 0s
	}
</style>