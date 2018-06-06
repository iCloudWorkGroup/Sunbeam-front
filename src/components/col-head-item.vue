<template>
    <div class="col-head-item" :style="{
        left: (col.left - offsetLeft) + 'px', 
        borderRight: borderRight,
        width: width + 'px'
    }" :class="{active: col.active}">
        <div class="item">{{col.displayName}}</div>
    </div>
</template>
<script type="text/javascript">
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        // left() {
        //     return this.col.left - this.offsetLeft;
        // },
        width() {
            if (this.col.rightAjacentHide) {
                return this.col.width - 2;
            }
            return this.col.width;
        },
        // displayName() {
        //     return this.col.displayName;
        // },
        // isActive() {
        //     return this.col.active;
        // },
        borderRight() {
            if (this.col.rightAjacentHide) {
                return 'double #bfbfbf';
            }
            return;
        }
    }
};
</script>
