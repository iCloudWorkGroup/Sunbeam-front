<template>
<div class="col"
     :style="{ left, width }">
</div>
</template>
<script>
import {
    unit
} from '../filters/unit'
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        left() {
            return unit(this.col.left - this.offsetLeft)
        },
        width() {
            return unit(this.col.width)
        }
    }
}
</script>