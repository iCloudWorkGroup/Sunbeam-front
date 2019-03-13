<template>
    <div class="cell"
        :style="viewPosi">
        <div class="cell-content"
             :style="viewProps"
             v-html="text">
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
    /**
     * type代表边框的类型，
     * 0, 无边框
     * 1, 细边框
     * 2, 粗边框
     */
    switch (type) {
        case 0:
            width = 1
            color = 'transparent'
            padding = 1
            margin = 1
            break
        case 1:
            width = 1
            color = '#000'
            padding = 1
            margin = 1
            break
        case 2:
            width = 2
            color = '#000'
            padding = 0
            margin = 0
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
        text() {
            let reg = new RegExp('\n', 'g')
            let spaceReg1 = new RegExp(' ', 'g')
            let spaceReg2 = new RegExp('　', 'g')
            if (this.cell.content.displayTexts == null) {
                return null
            }
            return this.cell.content.displayTexts.toString().replace(reg, '<br>').replace(spaceReg1, '&nbsp;').replace(spaceReg2, '&ensp;')
        },
        comment() {
            return this.cell.customProp.comment != null && this.cell.customProp.comment !== ''
        },
        viewPosi() {
            const physicsBox = this.cell.physicsBox
            const borderProp = this.cell.border
            // let rowIndex = this.$store.getters.rowIndexByAlias(this.cell.occupy.row[0])
            // let viewRowTop = this.$store.getters.viewTop(rowIndex)
            let top = physicsBox.top - this.offsetTop
            // top = top < 2 ? top + 2 : top
            // let colIndex = this.$store.getters.colIndexByAlias(this.cell.occupy.col[0])
            // let viewColLeft = this.$store.getters.viewLeft(colIndex)
            let left = physicsBox.left - this.offsetLeft
            // left = left < 2 ? left + 2 : left
            let width = physicsBox.width
            width = width < 2 ? width + 2 : width
            let height = physicsBox.height
            height = height < 2 ? height + 2 : height
            let background = this.cell.content.background
            let topBorder = caclBorder({
                type: borderProp.top
            }, {
                colorName: 'borderTopColor',
                widthName: 'borderTopWidth',
                paddingName: 'paddingTop'
            })
            let rightBorder = caclBorder({
                type: borderProp.right
            }, {
                colorName: 'borderRightColor',
                widthName: 'borderRightWidth',
                paddingName: 'paddingRight'
            })
            let bottomBorder = caclBorder({
                type: borderProp.bottom
            }, {
                colorName: 'borderBottomColor',
                widthName: 'borderBottomWidth',
                paddingName: 'paddingBottom'
            })
            let leftBorder = caclBorder({
                type: borderProp.left
            }, {
                colorName: 'borderLeftColor',
                widthName: 'borderLeftWidth',
                paddingName: 'paddingLeft'
            })
            if (leftBorder.borderLeftWidth === '2px') {
                left = left - 1
                width = width + 1
            }
            if (topBorder.borderTopWidth === '2px') {
                top = top - 1
                height = height + 1
            }
            // 为合并单元格且背景色为透明时，处理背景与边框颜色
            if (this.cell.occupy.col.length > 1 || this.cell.occupy.row.length > 1) {
                if (typeof this.cell.content.background === 'undefined' || this.cell.content.background === 'transparent' || this.cell.content.background === 'rgba(255, 255, 255, 0)') {
                    background = 'rgb(255, 255, 255)'
                }
            }
            return extend({
                // 因为现实的效果，需要共享单元格的边框
                // 所以在左、上两面都 -2，这样可以对齐效果
                top: unit(top - 2),
                left: unit(left - 2),
                width: unit(width - 2),
                height: unit(height - 2)
            }, topBorder, rightBorder, bottomBorder, leftBorder, {
                backgroundColor: background
            })
        },
        viewProps() {
            let attrs = this.cell.content
            let props = {
                color: attrs.color,
                fontSize: attrs.size + 'pt',
                fontFamily: attrs.family,
                textDecoration: attrs.underline ? 'underline' : '',
                fontWeight: attrs.weight ? '900' : 'normal',
                fontStyle: attrs.italic ? 'italic ' : ''
            }
            if (attrs.wordWrap) {
                props.wordBreak = 'break-word'
                // props.whiteSpace = 'pre-line'
            } else {
                props.whiteSpace = 'nowrap'
            }
            if (attrs.alignRow !== '') {
                props.textAlign = attrs.alignRow
            } else {
                props.textAlign = attrs.alignRowFormat
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
            let getCells = getters.cellsByVertical
            let occupyCol = this.item.occupy.col
            let occupyRow = this.item.occupy.row
            let startColIndex = getters.colIndexByAlias(occupyCol[0])
            let startRowIndex = getters.rowIndexByAlias(occupyRow[0])
            let endColIndex = getters.colIndexByAlias(occupyCol[occupyCol.length - 1])
            let endRowIndex = getters.rowIndexByAlias(occupyRow[occupyRow.length - 1])
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
    },
    methods: {
        commentShow(e) {
            this.$emit('moveon', this.cell)
        },
        commentHide() {
            this.$emit('moveout')
        }
    },
}
</script>