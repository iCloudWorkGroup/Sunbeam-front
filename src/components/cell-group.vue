<template>
<div class="cell-group">
    <cell-item
        v-for="item in cells"
        :key="item.alias"
        :cell="item"
        :offsetTop="offsetTop"
        :offsetLeft="offsetLeft">
    </cell-item>
</div>
</template>
<script>
import CellItem from './cell-item.vue'
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
        cells() {
            let getters = this.$store.getters
            let startColIndex = getters.colIndexByAlias(this.colStart)
            let endColIndex = getters.colIndexByAlias(this.colOver)
            let startRowIndex = getters.rowIndexByAlias(this.rowStart)
            let endRowIndex = getters.rowIndexByAlias(this.rowOver)
            return this.$store.getters.cellsByVerticalShouldShow({
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        }
    },
    components: {
        CellItem
    }
}
</script>