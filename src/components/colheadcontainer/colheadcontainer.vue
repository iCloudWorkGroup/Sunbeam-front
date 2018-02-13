<template>
	<div class="col-head-container" :style="{width: width + 'px'}">
		<div class="col-head-panel col-head-bg col-head-height" :totalWidth="totalWidth">
			<col v-for="item in colList" :item="item"></col>
		</div>
	</div>
</template>
<script type="text/javascript">
	import col from '../col/col.vue';

	export default {
		props: ['colContainerWidth'],
		components: {
			col,
		},
		computed: {
			width() {
				return this.colContainerWidth;
			},
			colList() {
				return this.$store.getters.colList;
			},
			totalWidth() {

			}
		},
		methods: {
		}
	}
</script>
<style>
</style>