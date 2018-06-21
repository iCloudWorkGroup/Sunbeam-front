<template>
<div class="col-head-container"
     :style="{width: width + 'px'}">
    <div class="col-head-bg col-head-height"
         :style="{
        width: totalWidth}">
        <col-head-panel :frozenRule="frozenRule"></col-head-panel>
        <div class="col-head-line"
             v-for="item in selectList"
             :style="{
            left: item.physicsBox.left - offsetLeft + 'px',
            width: item.physicsBox.width - 2 + 'px'}"></div>
    </div>
</div>

</template>

<script type="text/javascript">
import ColHeadPanel from './col-head-panel.vue'

export default {
    props: ['colHeadWidth', 'scrollLeft', 'frozenRule'],
    data() {
        let startIndex
        let endIndex

        if (this.frozenRule) {
            startIndex = this.frozenRule.startColIndex
            endIndex = this.frozenRule.endColIndex
        }
        return {
            startIndex,
            endIndex
        }
    },
    components: {
        ColHeadPanel,
    },
    computed: {
        width() {
            return this.colHeadWidth
        },
        totalWidth() {
            let visibleCols = this.$store.getters.visibleColList
            let frozenRule = this.frozenRule
            let startColIndex
            let endColIndex
            let lastCol
            let startCol

            if (frozenRule) {
                startColIndex = frozenRule.startColIndex
                if (frozenRule.endColIndex !== 'undefined') {
                    endColIndex = frozenRule.endColIndex
                } else {
                    endColIndex = visibleCols.length - 1
                }
                startCol = visibleCols[startColIndex]
                lastCol = visibleCols[endColIndex]
            } else {
                endColIndex = visibleCols.length - 1
                startCol = visibleCols[0]
                lastCol = visibleCols[endColIndex]
            }
            return lastCol.left + lastCol.width - startCol.left + 'px'
        },
        offsetLeft() {
            if (this.frozenRule) {
                return this.frozenRule.offsetLeft
            } else {
                return 0
            }
        },
        selectList() {
            return this.$store.getters.selectList
        }
    },
    watch: {
        scrollLeft(val) {
            this.$el.scrollLeft = val
        }
    },
    methods: {}
}
</script>
<style>
.col-head-container {
    z-index: 100;
    background: white;
}
</style>