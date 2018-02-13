<template>
	<div class="col-head-container" :style="{width: width + 'px'}">
		<div class="col-head-panel col-head-bg col-head-height">
			<col-head-item v-for="item in colList" :item="item"></col-head-item>
		</div>
	</div>
</template>
<script type="text/javascript">
	export default {
		props: ['colContainerWidth'],
		computed: {
			width() {
				return this.colContainerWidth;
			},
			colList() {
				console.log(this.$store.getters.colList);
				return this.$store.getters.colList;
			}
		},
		methods: {
		}
	}
</script>
<style>
	.col-head-panel { position: relative; height: inherit; width: inherit; z-index: 9; }
</style>