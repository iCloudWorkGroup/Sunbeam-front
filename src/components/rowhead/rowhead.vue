<template>
	<div class="row-head-container" :style="{height: height + 'px'}">
		<div class="row-head-bg row-head-width" :style="{height: totalHeight + 'px'}">
			<row-head-panel></row-head-panel>
			<div v-for="item in selectList" class="row-head-line" :style="{top: item.physicsBox.top + 'px', height: item.physicsBox.height - 2 + 'px'}"></div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import rowHeadPanel from '../rowheadpanel/rowheadpanel.vue';

	export default {
		props: ['rowHeadHeight'],
		components: {
			'row-head-panel': rowHeadPanel,
		},
		computed: {
			height() {
				return this.rowHeadHeight;
			},
			totalHeight() {
				let rowList = this.$store.getters.rowList,
					lastRow = rowList[rowList.length - 1];
				return lastRow.top + lastRow.height;
			},
			selectList() {
				return this.$store.getters.selectList;
			}
		},
		methods: {}
	};
</script>
<style>
</style>