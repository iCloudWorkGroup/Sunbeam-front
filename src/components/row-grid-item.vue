<template>
<div class="row"
     :style="{ top, height, background }">
</div>
</template>
<script>
import {
    unit
} from '../filters/unit'
export default {
    props: ['row', 'offsetTop'],
    computed: {
        top() {
            // let rowIndex = this.$store.getters.rowIndexByAlias(this.row.alias)
            // let viewRowTop = this.$store.getters.viewTop(rowIndex)
            return unit(this.row.top - this.offsetTop)
        },
        height() {
            return unit(this.row.height)
        },
        background() {
            if (typeof this.row.props.content !== 'undefined') {
                return this.row.props.content.background
            }
            return null
        }
    }
}
</script>