<template>
	<div class="row-head-panel">
		<row-head-item v-for="row in rowList" :key="row" :row="row"></row-head-item>
	</div>
</template>
<script type="text/javascript">
	import rowHeadItem from './row-head-item.vue';
	
	export default {
		components: {
			'row-head-item': rowHeadItem
		},
		computed: {
			rowList() {
				return this.$store.getters.rowList;
			},
		}
	};
</script>
<style type="text/css">
	
</style>