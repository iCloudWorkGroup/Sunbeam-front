<template>
    <div class="row-head-container" :style="{
    height: height + 'px'}">
        <div class="row-head-bg row-head-width" :style="{
        height: totalHeight + 'px'}">
            <row-head-panel></row-head-panel>
            <div class="row-head-line" v-for="item in selectList" :key="item.alias"  :style="{
            top: item.physicsBox.top + 'px', 
            height: item.physicsBox.height - 2 + 'px'}"></div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import RowHeadPanel from './row-head-panel.vue';
    
	export default {
		props: ['rowHeadHeight', 'scrollTop'],
		components: {
			RowHeadPanel,
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
		watch: {
			scrollTop() {
				this.$el.scrollTop = this.scrollTop;
			}
		},
		methods: {}
	};
</script>
<style>
</style>