<template>
<div class="col-head-item"
     :style="{left, borderRight, width}"
     :class="{active: col.active}">
    <div class="item">{{col.displayName}}</div>
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
            if (this.col.rightAjacentHide) {
                return this.col.width - 2
            }
            return unit(this.col.width)
        },
        borderRight() {
            if (this.col.rightAjacentHide) {
                return 'double #bfbfbf'
            }
            return
        }
    }
}
</script>
