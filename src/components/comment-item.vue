<template>
    <!--<div class="comment-ico" :style="commentStyle">-->
        <!--<div-->
            <!--class="triangle"-->
            <!--@mouseleave="commentHide"-->
            <!--@mouseenter="commentShow">-->
        <!--</div>-->
    <!--</div>-->
    <div class="cell"
         :style="commentStyle"
         @mouseleave="commentHide"
         @mouseenter="commentShow">
        <div class="comment-ico">
        <div
        class="triangle"></div>
        </div>
    </div>
</template>
<script>
import {
    unit
} from '../filters/unit'
import extend from '../util/extend'
export default {
    props: ['cell', 'offsetTop', 'offsetLeft'],
    computed: {
        // comment() {
        //     return this.cell.customProp.comment != null && this.cell.customProp.comment !== ''
        // },
        commentStyle() {
            const physicsBox = this.cell.physicsBox
            let top = physicsBox.top - this.offsetTop + 2
            // comment triangle 需要在单元格右上角 所以left值需要加上单元格宽度
            let left = physicsBox.left - this.offsetLeft + physicsBox.width - 1
            return extend({
                // 因为现实的效果，需要共享单元格的边框
                // 所以在左、上两面都 -2，这样可以对齐效果
                top: unit(top - 4),
                left: unit(left - 3 - physicsBox.width),
                width: unit(physicsBox.width),
                height: unit(physicsBox.height)
            })
        },
    },
    methods: {
        commentShow(e) {
            this.$emit('moveon', this.cell)
        },
        commentHide() {
            this.$emit('moveout')
        }
    }
}
</script>
<style>
</style>