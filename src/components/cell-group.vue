<template>
    <div class="cell-group">
        <cell-item v-for="item in cellList" key="item" :item="item"></cell-item>
    </div>
</template>
<script type="text/javascript">
import CellItem from './cell-item.vue';
export default {
    computed: {
        cellList() {
            return this.$store.getters.cellList;
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