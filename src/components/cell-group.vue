<template>
    <div class="cell-group">
        <cell-item :class="item.alias" v-for="item in userViewCellList" :key="item.alias" :item="item"></cell-item>
    </div>
</template>
<script type="text/javascript">
import CellItem from './cell-item.vue';
export default {
    computed: {
        cellList() {
            return this.$store.getters.cellList;
        },
        userViewCellList(){
            return this.$store.getters.userViewCellList;
        }
    },
    components: {
        CellItem
    }
};
</script>
<style type="text/css">
.cell-group {
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
}
</style>