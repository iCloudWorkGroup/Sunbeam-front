<template>
<div class="row-head-container"
     :style="{ height: height + 'px'}">
    <div class="row-head-bg row-head-width"
         :style="{
            height: totalHeight
        }">
        <row-head-panel :frozenRule="frozenRule"></row-head-panel>
        <div class="row-head-line"
             v-for="item in selectList"
             :style="{
                top: item.physicsBox.top - offsetTop + 'px',
                height: item.physicsBox.height - 2 + 'px'
            }"></div>
    </div>
</div>
</template>
<script type="text/javascript">
import RowHeadPanel from './row-head-panel.vue'

<<<<<<< HEAD
			if(this.frozenRule){
				startIndex = this.frozenRule.startRowIndex;
				endIndex = this.frozenRule.endRowIndex;
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
	            let rows = this.$store.getters.rowList,
	                visibleRows = this.$store.getters.visibleRowList,
	                frozenRule = this.frozenRule,
	                lastRow,
	                startRow;

	            if (frozenRule) {
	            	startRow = rows[frozenRule.startRowIndex];
	                if (frozenRule.endRowIndex !== undefined) {
						lastRow = rows[frozenRule.endRowIndex];
	                }else {
	                	lastRow = visibleRows[visibleRows.length -1];
	                }
	            } else {
	                startRow = visibleRows[0];
	                lastRow = visibleRows[visibleRows.length - 1];
	            }
	            return lastRow.top + lastRow.height - startRow.top + 'px';
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
=======
export default {
    props: ['rowHeadHeight', 'scrollTop', 'frozenRule'],
    data() {
        let startIndex
        let endIndex

        if (this.frozenRule) {
            startIndex = this.frozenRule.startRowIndex
            endIndex = this.frozenRule.endRowIndex
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
            return this.rowHeadHeight
        },
        totalHeight() {
            let rows = this.$store.getters.rowList
            let visibleRows = this.$store.getters.visibleRowList
            let frozenRule = this.frozenRule
            let startRowIndex
            let endRowIndex
            let lastRow
            let startRow

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex
                if (frozenRule.endRowIndex !== 'undefined') {
                    endRowIndex = frozenRule.endRowIndex
                } else {
                    endRowIndex = visibleRows.length - 1
                }
                startRow = rows[startRowIndex]
                lastRow = rows[endRowIndex]
            } else {
                endRowIndex = visibleRows.length - 1
                startRow = visibleRows[0]
                lastRow = visibleRows[endRowIndex]
            }
            return lastRow.top + lastRow.height - startRow.top + 'px'
        },
        selectList() {
            return this.$store.getters.selectList
        },
        offsetTop() {
            if (this.frozenRule) {
                return this.frozenRule.offsetTop
            } else {
                return 0
            }
        },
    },
    watch: {
        scrollTop(val) {
            this.$el.scrollTop = val
        }
    },
    methods: {}
}
>>>>>>> master
</script>
<style>
    .row-head-container{
        z-index: 100;
        background: white;
    }
</style>