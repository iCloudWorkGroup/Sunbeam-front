<template>
<div class="row"
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
    props: ['row', 'offsetTop'],
    computed: {
        viewObj() {
            const content = this.row.props.content || {}
            const border = this.row.props.border || {}
            let top = this.row.top - this.offsetTop - 1
            let height = this.row.height
            let background = content.background
            let topBorder = caclBorder({
                type: border.top
            }, {
                colorName: 'borderTopColor',
                widthName: 'borderTopWidth',
            })
            let bottomBorder = caclBorder({
                type: border.left
            }, {
                colorName: 'borderBottomColor',
                widthName: 'borderBottomWidth',
            })
            return extend({
                top: unit(top),
                height: unit(height),
            }, topBorder, bottomBorder, {
                backgroundColor: background
            })
        }
    }
}
</script>