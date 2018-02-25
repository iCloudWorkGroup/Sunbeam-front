<template>
	<div class="col-head-container" :style="{width: width + 'px'}">
		<div class="col-head-bg col-head-height" :style="{width: totalWidth + 'px'}">
			<div class="col-head-panel">
				<col-head-item v-for="col in colList" :col="col"></col-head-item>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import colHeadItem from '../colheaditem/colheaditem.vue';

	export default {
		props: ['colContainerWidth'],

		components: {
			'col-head-item': colHeadItem
		},
		computed: {
			width() {
				return this.colContainerWidth;
			},
			totalWidth() {
				let colList = this.$store.getters.colList,
					lastCol = colList[colList.length - 1];
				return lastCol.left + lastCol.width;
			},
			colList() {
				return this.$store.getters.colList;
			}
		},
		methods: {
		}
	}
</script>
<style>
</style>