<template>
	<div class="select-group">
		<select-item v-for="item in selectList" :item="item"></select-item>
	</div>
</template>
<script type="text/javascript">
	import SelectItem from '../selectitem/selectitem.vue';

	export default {
		computed: {
			selectList() {
				return this.$store.getters.selectList;
			}
		},
		components: {
			'select-item': SelectItem
		}
	};
</script>
<style type="text/css">
	.select-group {
		position: absolute;
		top: 0;
		left: 0;
		width: inherit; 
		height: inherit;
	}
</style>