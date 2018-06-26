<template>
    <div class="cell" :style="cellPosi">
        <div class="cell-content" :style="cellProps">
            {{texts}}
        </div>
    </div>
</template>
<script>

import { unit } from '../filters/unit'
export default {
    props: ['item', 'frozenRule'],
    computed: {
        cellPosi() {
            const physicsBox = this.item.physicsBox
            const border = physicsBox.border
            let borderRightWidth = 0
            let borderBottomWidth = 0
            let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0
            let offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0
            let top = physicsBox.top - offsetTop - 1
            let left = physicsBox.left - offsetLeft - 1
            let width = physicsBox.width - 2
            let height = physicsBox.height - 2
            let paddingLeft = 1
            let paddingTop = 1
            let paddingBottom = 1
            let paddingRight = 1

            return {
                top: unit(top),
                left: unit(left),
                width: unit(width),
                height: unit(height),
                borderTopWidth: unit(borderTopWidth),
                borderLeftWidth: unit(borderLeftWidth),
                borderRightWidth: unit(borderRightWidth),
                borderBottomWidth: unit(borderBottomWidth),
                paddingLeft: unit(paddingLeft),
                paddingTop: unit(paddingTop),
                paddingBottom: unit(paddingBottom),
                paddingRight: unit(paddingRight)
            }
        },
        cellProps() {
            let cellContent = this.item.content
            let italic = cellContent.italic ? 'italic ' : ''
            let weight = cellContent.weight ? 'bold' : 'normal'
            let underline = cellContent.underline ? 'underline' : ''
            let font = cellContent.size + 'pt ' + cellContent.family

            return {
                background: cellContent.background,
                color: cellContent.color,
                textAlign: cellContent.alignRow,
                verticalAlign: cellContent.alignCol,
                font: font,
                fontFamily: cellContent.family,
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
}
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