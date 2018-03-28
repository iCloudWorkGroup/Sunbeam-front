<template>
    <div class="col-head-panel">
        <col-head-item v-for="col in userViewColList"  :key="col.alias" :col="col"></col-head-item>
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
        userViewColList() {
            return this.$store.getters.userViewColList;
        }
    }
};
</script>
<style type="text/css">
</style>