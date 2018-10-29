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
// import extend from '../util/extend'
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        left() {
            // let colIndex = this.$store.getters.colIndexByAlias(this.col.alias)
            // let viewColLeft = this.$store.getters.viewLeft(colIndex)
            return unit(this.col.left - this.offsetLeft)
        },
        width() {
            if (this.col.rightAjacentHide) {
                return unit(this.col.width - 2)
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
