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
                offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0,
                top = physicsBox.top - offsetTop,
                left = physicsBox.left - offsetLeft,
                width = physicsBox.width,
                height = physicsBox.height;

            top -= border.top && 1;
            left -= border.left && 1;

            if(border.left === 2){
                width--;
            }
            if(border.right === 2){
                width--;
            }
            if(border.top === 2){
                height--;
            }
            if(border.bottom === 2){
                height--;
            }

            return {
                top: unit(top),
                left: unit(left),
                width: unit(width),
                height: unit(height),
                borderTopWidth: unit(border.top),
                borderLeftWidth: unit(border.left),
                borderRightWidth: unit(border.right),
                borderBottomWidth: unit(border.bottom)
            }
        },
        cellProps() {
            let cellContent = this.item.content,
                italic = cellContent.italic ? 'italic ' : '',
                weight = cellContent.weight ? 'bold' : 'normal',
                underline = cellContent.underline ? 'underline': '',
                font = cellContent.size + 'pt ' + cellContent.family;

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
    border: 0 solid black;
}

.cell-content {
    display: table-cell;
    height: inherit;
    width: inherit;
}
</style>