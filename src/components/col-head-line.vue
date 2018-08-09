<template>
<div class="col-head-line"
     :style="{ left, width }"></div>
</template>
<script>
import {
    unit
} from '../filters/unit'
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        left() {
            return unit(this.col.physicsBox.left - this.offsetLeft)
        },
        width() {
            // -2 原因同行视图一样，见 row-head-line.vue
            return unit(this.col.physicsBox.width - 2)
        }
    }
}
</script>