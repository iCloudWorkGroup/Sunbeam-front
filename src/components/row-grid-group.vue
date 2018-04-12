<template>
    <div class="row-group">
        <div v-for="item in rowList" class="row" :key="item.alias" :style="{
        top: item.top - offsetTop + 'px', 
        height: item.height + 'px'}"></div>
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
            let rowList = this.$store.getters.rowList,
                startIndex,
                endIndex,
                lastCol;

            startIndex = this.startIndex || 0;
            endIndex = this.endIndex || rowList.length - 1;
            
            if(this.endIndex !== undefined){
                return rowList.slice(startIndex, endIndex + 1);
            }else{
                return this.$store.getters.userViewRowList;
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