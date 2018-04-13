<template>
    <div class="cell-group">
        <cell-item v-for="item in cellList" :key="item.alias" :item="item" :frozenRule="frozenRule">
        </cell-item>
    </div>
</template>
<script type="text/javascript">
import CellItem from './cell-item.vue';
export default {
    props: [
        'frozenRule'
    ],
    data() {
        let startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex;

        if (this.frozenRule) {
            startColIndex = this.frozenRule.startColIndex;
            endColIndex = this.frozenRule.endColIndex;
            startRowIndex = this.frozenRule.startRowIndex;
            endRowIndex = this.frozenRule.endRowIndex;
        }
        return {
            startColIndex,
            endColIndex,
            startRowIndex,
            endRowIndex
        }
    },
    computed: {
        cellList() {
            if (this.endRowIndex !== undefined && this.endColIndex !== undefined ){
                return this.$store.getters.getCellsByVertical({
                    startColIndex: this.startColIndex,
                    endColIndex: this.endColIndex,
                    startRowIndex: this.startRowIndex,
                    endRowIndex: this.endRowIndex
                });
            }else if (this.endRowIndex !== undefined) {
                return this.$store.getters.topRegionCellList;
            } else if (this.endColIndex !== undefined) {
                return this.$store.getters.leftRegionCellList;
            } else{
                return this.$store.getters.userViewCellList;
            }
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