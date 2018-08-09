<template>
<div class="select-group">
    <select-item
        v-for="item in selects"
        :key="item.alias"
        :select="item"
        :offsetLeft="offsetLeft"
        :offsetTop="offsetTop"/>
</div>
</template>
<script>
import SelectItem from './select-item.vue'
export default {
    props: [
        'rowStart',
        'rowOver',
        'colStart',
        'colOver',
        'offsetLeft',
        'offsetTop'
    ],
    computed: {
        selects() {
            return this.$store.getters.allSelects
        }
    },
    components: {
        SelectItem
    }
}
</script>
<style type="text/css">
.select-group {
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
}
</style>