<template>
    <div class="cell"
        :style="viewPosi">
        <div class="cell-content"
             :style="viewProps">
            {{cell.content.displayTexts}}
        </div>
    </div>
</template>
<script>
import {
    isNum,
    isDate
} from '../tools/format'
import {
    unit
} from '../filters/unit'
import extend from '../util/extend'
function caclBorder({
    type
}, {
    colorName,
    widthName,
    paddingName,
    marginName
}) {
    let color
    let width
    let padding
    let margin
    switch (type) {
        case 0:
            width = 1
            color = 'transparent'
            margin = 1
            padding = 1
            break
        case 1:
            width = 1
            color = '#000'
            margin = 1
            padding = 1
            break
        case 2:
            width = 3
            color = '#000'
            margin = 0
            padding = 0
            break
    }
    return {
        [widthName]: unit(width),
        [colorName]: color,
        [paddingName]: unit(padding),
        [marginName]: unit(margin)
    }
}
export default {
    props: ['cell', 'offsetTop', 'offsetLeft'],
    computed: {
        viewPosi() {
            const physicsBox = this.cell.physicsBox
            const borderProp = this.cell.border
            let top = physicsBox.top - this.offsetTop
            let left = physicsBox.left - this.offsetLeft
            let width = physicsBox.width
            let height = physicsBox.height
            let topBorder = caclBorder({
                type: borderProp.top
            }, {
                colorName: 'borderTopColor',
                widthName: 'borderTopWidth',
                paddingName: 'paddingTop',
                marginName: 'marginTop'
            })
            let rightBorder = caclBorder({
                type: borderProp.right
            }, {
                colorName: 'borderRightColor',
                widthName: 'borderRightWidth',
                paddingName: 'paddingRight',
                marginName: 'marginRight'
            })
            let bottomBorder = caclBorder({
                type: borderProp.bottom
            }, {
                colorName: 'borderBottomColor',
                widthName: 'borderBottomWidth',
                paddingName: 'paddingBottom',
                marginName: 'marginBottom'
            })
            let leftBorder = caclBorder({
                type: borderProp.left
            }, {
                colorName: 'borderLeftColor',
                widthName: 'borderLeftWidth',
                paddingName: 'paddingLeft',
                marginName: 'marginLeft'
            })
            return extend({
                // 因为现实的效果，需要共享单元格的边框
                // 所以在左、上两面都 -2，这样可以对齐效果
                top: unit(top - 2),
                left: unit(left - 2),
                width: unit(width - 2),
                height: unit(height - 2)
            }, topBorder, rightBorder, bottomBorder, leftBorder)
        },
        viewProps() {
            let attrs = this.cell.content
            let props = {
                background: attrs.background,
                color: attrs.color,
                textAlign: attrs.alignRow,
                fontSize: attrs.size + 'pt',
                fontFamily: attrs.family,
                textDecoration: attrs.underline ? 'underline' : '',
                fontWeight: attrs.weight ? '900' : 'normal',
                fontStyle: attrs.italic ? 'italic ' : ''
            }
            if (attrs.wordWrap) {
                props.wordBreak = 'break-word'
                props.whiteSpace = 'pre-line'
            } else {
                props.whiteSpace = 'nowrap'
            }
            if (attrs.alignCol !== '') {
                props.verticalAlign = attrs.alignCol
            } else {
                let type = attrs.type
                let texts = attrs.texts
                // 自动判断数据类型，根据类型设置位置效果
                if ((type === 'routine' && (isNum(texts) || isDate(texts))) || (type === 'number' && isNum(texts)) ||
                    (type === 'date' && isDate(texts))
                ) {
                    props.verticalAlign = 'left'
                }
            }
            return props
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
        }
    }
}
</script>