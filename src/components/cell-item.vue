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
            let borderRight = 0
            let borderBottom = 0
            let borderLeft = 0
            let borderTop = 0
            let paddingLeft = 1
            let paddingTop = 1
            let paddingBottom = 1
            let paddingRight = 1
            let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0
            let offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0
            let top = physicsBox.top - offsetTop - 1
            let left = physicsBox.left - offsetLeft - 1
            let width = physicsBox.width
            let height = physicsBox.height
            let nextThickBorder = this.nextThickBorder

            changeLeftValue(border.left, nextThickBorder.left)
            changeTopValue(border.top, nextThickBorder.top)
            changeRightValue(border.right, nextThickBorder.right)
            changeBottomValue(border.bottom, nextThickBorder.bottom)
            return {
                top: unit(top),
                left: unit(left),
                width: unit(width),
                height: unit(height),
                borderTopWidth: unit(borderTop),
                borderLeftWidth: unit(borderLeft),
                borderRightWidth: unit(borderRight),
                borderBottomWidth: unit(borderBottom),
                paddingLeft: unit(paddingLeft),
                paddingTop: unit(paddingTop),
                paddingBottom: unit(paddingBottom),
                paddingRight: unit(paddingRight)
            }
            function changeLeftValue(border, nextBorder) {
                if (border === 2) {
                    borderLeft = 3
                    paddingLeft = 0
                    left--
                    width--
                } else if (border === 1 && !nextBorder) {
                    paddingLeft = 0
                    borderLeft = 1
                } else if (nextBorder) {
                    width--
                    paddingLeft = 2
                }
            }

            function changeTopValue(border, nextBorder) {
                if (border === 2) {
                    borderTop = 3
                    paddingTop = 0
                    top--
                    height--
                } else if (border === 1 && !nextBorder) {
                    paddingTop = 0
                    borderTop = 1
                } else if (nextBorder) {
                    height--
                    paddingTop = 2
                }
            }

            function changeRightValue(border, nextBorder) {
                if (border === 2) {
                    borderRight = 3
                    paddingRight = 0
                    width--
                } else if (border === 1 && !nextBorder) {
                    paddingRight = 0
                    borderRight = 1
                } else if (nextBorder) {
                    paddingRight = 2
                    width--
                }
            }

            function changeBottomValue(border, nextBorder) {
                if (border === 2) {
                    borderBottom = 3
                    paddingBottom = 0
                    height--
                } else if (border === 1 && !nextBorder) {
                    paddingBottom = 0
                    borderBottom = 1
                } else if (nextBorder) {
                    paddingBottom = 2
                    height--
                }
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
        nextThickBorder() {
            let getters = this.$store.getters
            let getCells = getters.getCellsByVertical
            let occupyCol = this.item.occupy.col
            let occupyRow = this.item.occupy.row
            let startColIndex = getters.getColIndexByAlias(occupyCol[0])
            let startRowIndex = getters.getRowIndexByAlias(occupyRow[0])
            let endColIndex = getters.getColIndexByAlias(occupyCol[occupyCol.length - 1])
            let endRowIndex = getters.getRowIndexByAlias(occupyRow[occupyRow.length - 1])
            let result = {
                left: false,
                right: false,
                top: false,
                bottom: false
            }
            if (startColIndex > 0) {
                let cellList = getCells({
                    startColIndex: startColIndex - 1,
                    startRowIndex,
                    endRowIndex
                })
                for (let i = 0, len = cellList.length; i < len; i++) {
                    if (cellList[i].physicsBox.border.right === 2) {
                        result.left = true
                        break
                    }
                }
            }
            if (startRowIndex > 0) {
                let cellList = getCells({
                    startColIndex,
                    endColIndex,
                    startRowIndex: startRowIndex - 1
                })
                for (let i = 0, len = cellList.length; i < len; i++) {
                    if (cellList[i].physicsBox.border.bottom === 2) {
                        result.top = true
                        break
                    }
                }
            }
            if (endColIndex < getters.colList.length - 1) {
                let cellList = getCells({
                    startColIndex: endColIndex + 1,
                    startRowIndex,
                    endRowIndex
                })
                for (let i = 0, len = cellList.length; i < len; i++) {
                    if (cellList[i].physicsBox.border.left === 2) {
                        result.right = true
                        break
                    }
                }
            }
            if (endRowIndex < getters.rowList.length - 1) {
                let cellList = getCells({
                    startColIndex,
                    endColIndex,
                    startRowIndex: endRowIndex + 1
                })
                for (let i = 0, len = cellList.length; i < len; i++) {
                    if (cellList[i].physicsBox.border.top === 2) {
                        result.bottom = true
                        break
                    }
                }
            }
            return result
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