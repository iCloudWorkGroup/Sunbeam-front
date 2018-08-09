<template>
<div class="row"
     :style="{ top, height }">
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
            return unit(this.row.top - this.offsetTop)
        },
        height() {
            return unit(this.row.height)
        }
    }
}
</script>