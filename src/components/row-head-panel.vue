<template>
	<div class="row-head-panel">
		<row-head-item v-for="row in rowList" 
		:key="row.alias" :row="row" 
		:offsetTop="offsetTop"></row-head-item>
	</div>
</template>
<script type="text/javascript">
	import RowHeadItem from './row-head-item.vue';
	
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
			}
		}
	};
</script>
<style type="text/css">
	
</style>