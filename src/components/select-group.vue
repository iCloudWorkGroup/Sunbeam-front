<template>
<div class="select-group">
    <select-item
        v-for="item in selects"
        :key="item.alias"
        :select="item"
        :offsetLeft="offsetLeft"
        :offsetTop="offsetTop"/>
    <comment-item
            v-for="item in cells"
            :key="item.alias"
            :cell="item"
            :offsetTop="offsetTop"
            :offsetLeft="offsetLeft">
    </comment-item>
</div>
</template>
<script>
import SelectItem from './select-item.vue'
import CommentItem from './comment-item.vue'
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
        },
        cells() {
            let getters = this.$store.getters
            let startColIndex = getters.colIndexByAlias(this.colStart)
            let endColIndex = getters.colIndexByAlias(this.colOver)
            let startRowIndex = getters.rowIndexByAlias(this.rowStart)
            let endRowIndex = getters.rowIndexByAlias(this.rowOver)
            return this.$store.getters.cellsByVerticalHasComment({
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        }
    },
    components: {
        SelectItem,
        CommentItem
    },
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