<template>
<div class="row-head-line"
     :style="{ top, height }"></div>
</template>
<script>
import {
    unit
} from '../filters/unit'
export default {
    props: ['row', 'offsetTop'],
    computed: {
        top() {
            return unit(this.row.physicsBox.top - this.offsetTop)
        },
        height() {
            // 因为行的头，开始点没有上边线，所以
            // 开始点 -1
            // 同时为了行的内容对齐，不能算下边线
            // 所以总数据还得 -1
            // 所以最后需要减去开头和结尾的两部分
            // 是整体 -2
            let rowHeight = this.row.physicsBox.height - 2 > 0 ? this.row.physicsBox.height - 2 : 0
            return unit(rowHeight)
        }
    }
}
</script>