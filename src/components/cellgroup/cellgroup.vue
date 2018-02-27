<template>
	<div class="cell-group">
		<cell-item v-for="item in cellList" :item="item"></cell-item>
	</div>
</template>
<script type="text/javascript">
	import CellItem from '../cellitem/cellitem.vue';
	export default {
		computed: {
			cellList() {
				return this.$store.getters.cellList;
			}
		},
		components: {
			'cell-item': CellItem
		}
	};
</script>
<style type="text/css">
	.cell-group {
		position: absolute;
		top: 0;
		left: 0;
		width: inherit; 
		height: inherit;
	}
</style>
