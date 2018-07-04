<template>
    <div class="cell" :style="cellPosi">
        <div class="cell-content" :style="cellProps">{{texts}}</div>
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
            let borderRightWidth = 1
            let borderBottomWidth = 1
            let borderLeftWidth = 1
            let borderTopWidth = 1
            let borderRightColor = 'transparent'
            let borderBottomColor = 'transparent'
            let borderLeftColor = 'transparent'
            let borderTopColor = 'transparent'
            let paddingLeft = 0
            let paddingTop = 0
            let paddingBottom = 0
            let paddingRight = 0
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
                borderTopWidth: unit(borderTopWidth),
                borderLeftWidth: unit(borderLeftWidth),
                borderRightWidth: unit(borderRightWidth),
                borderBottomWidth: unit(borderBottomWidth),
                borderTopColor: borderTopColor,
                borderLeftColor: borderLeftColor,
                borderRightColor: borderRightColor,
                borderBottomColor: borderBottomColor,
                paddingLeft: unit(paddingLeft),
                paddingTop: unit(paddingTop),
                paddingBottom: unit(paddingBottom),
                paddingRight: unit(paddingRight)
            }
            function changeLeftValue(border, nextBorder) {
                if (border === 2) {
                    borderLeftWidth = 3
                    borderLeftColor = 'black'
                    left--
                    width--
                } else if (border === 1 && !nextBorder) {
                    borderLeftColor = 'black'
                } else if (nextBorder) {
                    height--
                    paddingTop = 1
                }
            }

            function changeTopValue(border, nextBorder) {
                if (border === 2) {
                    borderTopWidth = 3
                    borderTopColor = 'black'
                    top--
                    height--
                } else if (border === 1 && !nextBorder) {
                    borderTopColor = 'black'
                } else if (nextBorder) {
                    height--
                    paddingTop = 1
                }
            }

            function changeRightValue(border, nextBorder) {
                if (border === 2) {
                    borderRightWidth = 3
                    borderRightColor = 'black'
                    width--
                } else if (border === 1 && !nextBorder) {
                    borderRightColor = 'black'
                } else if (nextBorder) {
                    paddingRight = 1
                    width--
                }
            }

            function changeBottomValue(border, nextBorder) {
                if (border === 2) {
                    borderBottomWidth = 3
                    borderBottomColor = 'black'
                    height--
                } else if (border === 1 && !nextBorder) {
                    borderBottomColor = 'black'
                } else if (nextBorder) {
                    paddingBottom = 1
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
            let result = {
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
            if (cellContent.wordWrap) {
                result.wordBreak = 'break-word'
                result.whiteSpace = 'pre-line'
            } else {
                result.whiteSpace = 'pre'
            }
            return result
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