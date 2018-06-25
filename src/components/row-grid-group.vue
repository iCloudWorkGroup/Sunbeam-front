<template>
<div class="row-group">
    <div v-for="item in rowList"
         class="row"
         :key="item.alias"
         :style="{
            top: item.top - offsetTop + 'px',
            height: item.height + 'px'}">
    </div>
</div>
</template>
<script type="text/javascript">
export default {
    props: ['frozenRule'],
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
    computed: {
        offsetTop() {
            if (this.frozenRule) {
                return this.frozenRule.offsetTop
            } else {
                return 0
            }
        },
        rowList() {
            let getters = this.$store.getters
            let rows = getters.rowList
            let visibleRows = getters.visibleRowList
            let frozenRule = this.frozenRule
            let startRowIndex
            let endRowIndex
            let lastRow
            let startRow

            if (frozenRule) {
                startRowIndex = frozenRule.startRowIndex
                if (frozenRule.endRowIndex != null) {
                    endRowIndex = frozenRule.endRowIndex
                } else {
                    endRowIndex = visibleRows.length - 1
                }
                startRow = rows[startRowIndex]
                lastRow = rows[endRowIndex]
                startRowIndex = getters.getVisibleRowIndexBySort(startRow.sort)
                endRowIndex = getters.getVisibleRowIndexBySort(lastRow.sort)
                return visibleRows.slice(startRowIndex, endRowIndex + 1)
            } else {
                return getters.userViewRowList
            }
        }
    }
}
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