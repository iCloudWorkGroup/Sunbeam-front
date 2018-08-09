<template>
<div class="row-group">
    <row-grid-item
        v-for="item in viewRows"
        :row="item"
        :offsetTop="offsetTop"
        :key="item.alias"/>
</div>
</template>
<script>
import RowGridItem from './row-grid-item.vue'
export default {
    props: ['start', 'over', 'offsetTop'],
    computed: {
        viewRows() {
            return this.$store.getters.rowsByRange(this.start, this.over)
        }
    },
    components: {
        RowGridItem
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