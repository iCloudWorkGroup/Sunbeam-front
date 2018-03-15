<template>
    <div class="col-group">
        <div class="col" v-for="item in userViewColList" :key="item.alias"  :style="{
		left: item.left + 'px', 
		width: item.width + 'px'}">
        </div>
    </div>
</template>
<script type="text/javascript">
    export default {
        computed: {
            colList() {
                return this.$store.getters.colList;
            },
            userViewColList(){
                return this.$store.getters.userViewColList;
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