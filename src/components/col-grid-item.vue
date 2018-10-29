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
            // let colIndex = this.$store.getters.colIndexByAlias(this.col.alias)
            // let viewColLeft = this.$store.getters.viewLeft(colIndex)
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