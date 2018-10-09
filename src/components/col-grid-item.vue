<template>
<div class="col"
     :style="{ left, width, background }">
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
        },
        background() {
            return this.col.props.content.background
        }
    }
}
</script>