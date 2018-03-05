<template>
    <div class="row-group">
        <div v-for="item in rowList" class="row" :key="item.alias" :style="{
        top: item.top + 'px', 
        height: item.height + 'px'}"></div>
    </div>
</template>
<script type="text/javascript">
export default {
    computed: {
        rowList() {
            return this.$store.getters.rowList;
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