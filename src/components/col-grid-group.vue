<template>
    <div class="col-group">
        <div class="col" v-for="item in colList" :key="item.alias"  :style="{
		left: item.left - offsetLeft + 'px', 
		width: item.width + 'px'}">
        </div>
    </div>
</template>
<script type="text/javascript">
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
    .col-group {
        position: absolute;
        left: 0;
        top: 0;
        width: inherit;
        height: inherit;
    }
</style>