<template>
<div class="col"
     :style="viewObj">
</div>
</template>
<script>
import {
    unit
} from '../filters/unit'
import extend from '../util/extend'
function caclBorder({
    type
}, {
    colorName,
    widthName,
}) {
    let color
    let width
    /**
     * type代表边框的类型，
     * 0, 无边框
     * 1, 细边框
     * 2, 粗边框
     */
    switch (type) {
        case 0:
            width = 1
            color = '#d4d4d4'
            break
        case 1:
            width = 1
            color = '#000'
            break
        case 2:
            width = 1
            color = '#000'
            break
        default:
            width = 1
            color = '#d4d4d4'
            break
    }
    return {
        [widthName]: unit(width),
        [colorName]: color,
    }
}
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        viewObj() {
            const content = this.col.props.content
            const border = this.col.props.border || {}
            let left = this.col.left - this.offsetLeft - 1
            let width = this.col.width
            let background = content.background
            let rightBorder = caclBorder({
                type: border.right
            }, {
                colorName: 'borderRightColor',
                widthName: 'borderRightWidth',
            })
            let leftBorder = caclBorder({
                type: border.left
            }, {
                colorName: 'borderLeftColor',
                widthName: 'borderLeftWidth',
            })
            return extend({
                left: unit(left),
                width: unit(width),
            }, rightBorder, leftBorder, {
                backgroundColor: background
            })
        }
    }
}
</script>