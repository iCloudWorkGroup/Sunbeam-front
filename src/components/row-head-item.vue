<template>
<div class="row-head-item"
     :class="{active: active}"
     :style="{
        top: top + 'px',
        borderBottom: borderBottom,
        height: height + 'px'}">
    <div class="item">{{displayName}}</div>
</div>
</template>
<script type="text/javascript">
export default {
    props: ['row', 'offsetTop'],
    computed: {
        top() {
            return this.row.top - this.offsetTop
        },
        height() {
            if (this.row.bottomAjacentHide) {
                return this.row.height - 2
            }
            return this.row.height
        },
        displayName() {
            return this.row.displayName
        },
        active() {
            return this.row.active
        },
        borderBottom() {
            if (this.row.bottomAjacentHide) {
                return 'double #bfbfbf'
            }
            return
        }
    },
    methods: {

    }
}
</script>