<template>
<div class="row-head-item"
     :style="{ top, borderBottom, height }"
     :class="{active: row.active}">
    <div class="item">{{ row.displayName }}</div>
</div>
</template>
<script type="text/javascript">
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
            if (this.row.bottomAjacentHide) {
                return this.row.height - 2
            }
            return unit(this.row.height)
        },
        borderBottom() {
            if (this.row.bottomAjacentHide) {
                return 'double #bfbfbf'
            }
            return
        }
    }
}
</script>