<template>
	<div class="row-head-panel" ref="panel" @mousedown="mouseDownHandle" @mousemove="mouseMoveHandle">
		<row-head-item v-for="row in rowList" 
		:key="row.alias" :row="row" 
		:offsetTop="offsetTop"></row-head-item>
	</div>
</template>

<script type="text/javascript">
	import RowHeadItem from './row-head-item.vue';
	import {SELECTS_UPDATESELECT} from '../store/action-types';
	import {UPDATE_MOUSESTATE} from '../store/mutation-types';
	import {LOCATE, DRAG} from '../tools/basic';

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
				endIndex
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
				let rowList = this.$store.getters.rowList,
	                startIndex,
	                endIndex,
	                lastCol;

	            startIndex = this.startIndex || 0;
	            endIndex = this.endIndex || rowList.length - 1;
	            
	            if(this.endIndex !== undefined){
	                return rowList.slice(startIndex, endIndex + 1);
	            }else{
	                return this.$store.getters.userViewRowList;
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
				offsetTop = this.offsetTop,
				box;

			box = elem.getBoundingClientRect();

			let rowPosi = e.clientY - box.top + offsetTop,
				rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi);

			this.$store.dispatch(SELECTS_UPDATESELECT, {
				colIndex: 'MAX',
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
				offsetTop = 0,
				box;

			if (frozenRule) {
				offsetTop = frozenRule.offsetTop;
			}
			box = elem.getBoundingClientRect();

			let rowPosi = e.clientY - box.top + offsetTop,
				rowIndex = this.$store.getters.getRowIndexByPosi(rowPosi);

			console.log(rowIndex);
			this.$store.dispatch(SELECTS_UPDATESELECT, {
				colIndex: 'MAX',
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
	
</style>