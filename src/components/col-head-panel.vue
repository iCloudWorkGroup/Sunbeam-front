<template>
    <div class="col-head-panel">
        <col-head-item v-for="col in colList" :col="col"></col-head-item>
    </div>
</template>
<script type="text/javascript">
import colHeadItem from './col-head-item.vue';

export default {
    components: {
        'col-head-item': colHeadItem
    },
    computed: {
        colList() {
            return this.$store.getters.colList;
        },
    }
};
</script>
<style type="text/css">
</style>