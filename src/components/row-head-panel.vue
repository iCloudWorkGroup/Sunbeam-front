<template>
	<div class="row-head-panel">
		<row-head-item v-for="row in userViewRowList" :key="row.alias" :row="row"></row-head-item>
	</div>
</template>
<script type="text/javascript">
	import RowHeadItem from './row-head-item.vue';
	
	export default {
		components: {
			RowHeadItem
		},
		computed: {
			rowList() {
				return this.$store.getters.rowList;
			},
			userViewRowList() {
				return this.$store.getters.userViewRowList;
			}
		}
	};
</script>
<style type="text/css">
	
</style>