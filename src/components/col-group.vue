<template>
	<div class="col-group">
		<div v-for="item in colList" :key="item.alias" class="col" 
		:style="{left: item.left + 'px', width: item.width + 'px'}">
		</div>
	</div>
</template>
<script type="text/javascript">
	export default {
		computed: {
			colList() {
				return this.$store.getters.colList;
			}
		}
	};
</script>
<style type="text/css">
	.col-group {
		position: absolute;
		left: 0;
		top: 0;
		width: inherit; 
		height: inherit;
	}
</style>
