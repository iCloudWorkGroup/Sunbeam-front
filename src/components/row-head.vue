<template>
    <div class="row-head-container" :style="{ height: height + 'px'}">
        <div class="row-head-bg row-head-width" :style="{
        height: totalHeight + 'px'}">
            <row-head-panel :frozenRule = "frozenRule"></row-head-panel>
            <div class="row-head-line" v-for="item in selectList"
				:style="{
            		top: item.physicsBox.top - offsetTop + 'px', 
            		height: item.physicsBox.height - 2 + 'px'
            	}"></div>
        </div>
    </div>
</template>
<script type="text/javascript">
    import RowHeadPanel from './row-head-panel.vue';
    
	export default {
		props: ['rowHeadHeight', 'scrollTop', 'frozenRule'],
		data() {
			let startIndex,
				endIndex;

			if(this.frozenRule){
				startIndex = this.frozenRule.startColIndex;
				endIndex = this.frozenRule.endColIndex;
			}
			return {
				startIndex,
				endIndex
			}
		},
		components: {
			RowHeadPanel,
		},
		computed: {
			height() {
				return this.rowHeadHeight;
			},
			totalHeight() {
				let rowList = this.$store.getters.rowList,
					startIndex,
					endIndex,
					lastRow;

				startIndex = this.startIndex || 0;
				endIndex = this.endIndex || rowList.length - 1;
				lastRow = rowList[endIndex];
				return lastRow.top + lastRow.height - rowList[startIndex].top;
			},
			selectList() {
				return this.$store.getters.selectList;
			},
			offsetTop() {
				if(this.frozenRule){
					return this.frozenRule.offsetTop; 
				}else{
					return 0;
				}
			},
		},
		watch: {
			scrollTop(val) {
				this.$el.scrollTop = val;
			}
		},
		methods: {}
	};
</script>
<style>
</style>