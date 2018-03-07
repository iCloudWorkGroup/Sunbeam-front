<template>
	<div class="col-head-container" :style="{width: width + 'px'}">
		<div class="col-head-bg col-head-height" :style="{width: totalWidth + 'px'}">
			<col-head-panel></col-head-panel>
			<div v-for="item in selectList" class="col-head-line" :style="{left: item.physicsBox.left + 'px', width: item.physicsBox.width - 2 + 'px'}"></div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import ColHeadPanel from './col-head-panel.vue';

	export default {
		props: ['colHeadWidth' , 'scrollLeft'],
		components: {
			ColHeadPanel,
		},
		computed: {
			width() {
				return this.colHeadWidth;
			},
			totalWidth() {
				let colList = this.$store.getters.colList,
					lastCol = colList[colList.length - 1];
				return lastCol.left + lastCol.width;
			},
			selectList() {
				return this.$store.getters.selectList;
			}
		},
		watch: {
			scrollLeft(val) {
				this.$el.scrollLeft = val;
			}
		},
		methods: {
		}
	};
</script>
<style>
</style>