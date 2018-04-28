<template>
    <div class="row-group">
        <div v-for="item in rowList" class="row" :key="item.alias" :style="{
            top: item.top - offsetTop + 'px', 
            height: item.height + 'px'}"> 
        </div>
    </div>
</template>
<script type="text/javascript">
export default {
    props: ['frozenRule'],
    data() {
        let startIndex,
            endIndex;
        if (this.frozenRule) {
            startIndex = this.frozenRule.startRowIndex;
            endIndex = this.frozenRule.endRowIndex;
        }
        return {
            startIndex,
            endIndex
        }
    },
    computed: {
        offsetTop() {
            if (this.frozenRule) {
                return this.frozenRule.offsetTop;
            } else {
                return 0;
            }
        },
        rowList() {
            let getters = this.$store.getters,
                rows = getters.rowList,
                visibleRows = getters.visibleRowList,
                frozenRule = this.frozenRule,
                startRowIndex,
                endRowIndex,
                lastRow,
                startRow;

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex;
                if (frozenRule.endRowIndex !== undefined) {
                    endRowIndex = frozenRule.endRowIndex;
                }
                startRow = rows[startRowIndex];
                lastRow = rows[endRowIndex];
                startRowIndex = getters.getVisibleRowIndexBySort(startRow.sort);
                endRowIndex = getters.getVisibleRowIndexBySort(startRow.sort);
                return visibleCols.slice(startRowIndex, endRowIndex + 1);
            } else {
                return getters.userViewRowList;
            }
        }
    }
};
</script>
<style type="text/css">
    .row-group {
        position: absolute;
        top: 0;
        left: 0;
        width: inherit;
        height: inherit;
    }
</style>