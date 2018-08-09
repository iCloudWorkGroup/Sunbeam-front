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
            let startColIndex = getters.getColIndexByAlias(this.colStart)
            let endColIndex = getters.getColIndexByAlias(this.colOver)
            let startRowIndex = getters.getRowIndexByAlias(this.rowStart)
            let endRowIndex = getters.getRowIndexByAlias(this.rowOver)
            return this.$store.getters.getCellsByVertical({
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