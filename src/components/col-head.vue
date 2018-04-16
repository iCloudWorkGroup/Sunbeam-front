<template>
    <div class="col-head-container" :style="{width: width + 'px'}">
        <div class="col-head-bg col-head-height" :style="{
        width: totalWidth + 'px'}">
            <col-head-panel :frozenRule="frozenRule"></col-head-panel>
            <div class="col-head-line" v-for="item in selectList" :style="{
            left: item.physicsBox.left - offsetLeft + 'px', 
            width: item.physicsBox.width - 2 + 'px'}"></div>
        </div>
    </div>
</template>
<script type="text/javascript">
import ColHeadPanel from './col-head-panel.vue';

export default {
    props: ['colHeadWidth', 'scrollLeft', 'frozenRule'],
    data() {
        let startIndex,
            endIndex;

        if (this.frozenRule) {
            startIndex = this.frozenRule.startColIndex;
            endIndex = this.frozenRule.endColIndex;
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
            return this.colHeadWidth;
        },
        totalWidth() {
            let colList = this.$store.getters.colList,
                startIndex,
                endIndex,
                lastCol;

            startIndex = this.startIndex || 0;
            endIndex = this.endIndex || colList.length - 1;
            lastCol = colList[endIndex];
            return lastCol.left + lastCol.width - colList[startIndex].left;
        },
        offsetLeft() {
            if (this.frozenRule) {
                return this.frozenRule.offsetLeft;
            } else {
                return 0;
            }
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
    methods: {}
};
</script>
<style>
</style>