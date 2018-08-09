<template>
<div class="col-group">
    <col-grid-item
        v-for="item in viewCols"
        :col="item"
        :offsetLeft="offsetLeft"
        :key="item.alias"/>
</div>
</template>
<script>
import ColGridItem from './col-grid-item.vue'
export default {
    props: ['start', 'over', 'offsetLeft'],
    computed: {
        viewCols() {
            return this.$store.getters.colsByRange(this.start, this.over)
        }
    },
    components: {
        ColGridItem
    }
}
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