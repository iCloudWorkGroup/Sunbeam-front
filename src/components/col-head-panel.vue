<template>
    <div class="col-head-panel">
        <col-head-item v-for="col in colList"  :key="col.alias" :col="col" :offsetLeft="offsetLeft"></col-head-item>
    </div>
</template>
<script type="text/javascript">
import colHeadItem from './col-head-item.vue';

export default {
    props: ['frozenRule'],
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
        'col-head-item': colHeadItem
    },
    computed: {
        offsetLeft() {
            if(this.frozenRule){
                return this.frozenRule.offsetLeft; 
            }else{
                return 0;
            }
        },
        colList() {
            let colList = this.$store.getters.colList,
                startIndex,
                endIndex,
                lastCol;

            startIndex = this.startIndex || 0;
            endIndex = this.endIndex || colList.length - 1;
            
            if(this.endIndex !== undefined){
                return colList.slice(startIndex, endIndex + 1);
            }else{
                return this.$store.getters.userViewColList;
            }
        }
    }
};
</script>
<style type="text/css">
</style>