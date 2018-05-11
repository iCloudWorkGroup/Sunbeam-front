<template>
    <div class="cell" :style="cellPosi">
        <div class="cell-content" :style="cellProps">
            {{texts}}
        </div>
    </div>
</template>
<script type="text/javascript">
import { unit } from '../filters/unit'
export default {
    props: ['item', 'frozenRule'],
    computed: {
        cellPosi() {
            const physicsBox = this.item.physicsBox,
                  border = physicsBox.border;
            let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0,
                offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0;

            return {
                top: unit(physicsBox.top - offsetTop - 1),
                left: unit(physicsBox.left - offsetLeft - 1),
                width: unit(physicsBox.width),
                height: unit(physicsBox.height),
                borderTopColor: border.top ? '#000' : 'transparent',
                borderLeftColor: border.left ? '#000' : 'transparent',
                borderRightColor: border.right ? '#000' : 'transparent',
                borderBottomColor: border.bottom ? '#000' : 'transparent'
            }
        },
        cellProps() {
            let cellContent = this.item.content,
                italic = cellContent.italic ? 'italic ' : '',
                weight = cellContent.weight ? 'bold' : 'normal',
                underline = cellContent.underline ? 'underline': '',
                font = unit(cellContent.size) + ' ' + cellContent.family;

            return {
                background: cellContent.background,
                color: cellContent.color,
                textAlign: cellContent.alignRow,
                verticalAlign: cellContent.alignCol,
                font: font,
                textDecoration: underline,
                fontWeight: weight,
                fontStyle: italic
            }
        },
        texts() {
            return this.item.content.texts
        }
    },
    filters: {
        unit
    }
};
</script>
<style type="text/css">
.cell {
    position: absolute;
    overflow: hidden;
    cursor: default;
    border: 1px solid transparent;
}

.cell-content {
    display: table-cell;
    height: inherit;
    width: inherit;
}
</style>