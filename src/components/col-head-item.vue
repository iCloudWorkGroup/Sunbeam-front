<template>
    <div class="col-head-item" :style="{
    left: left + 'px', 
    width: width + 'px'}" :class="{active: active}">
        <div class="item">{{displayName}}</div>
    </div>
</template>
<script type="text/javascript">
export default {
    props: ['col', 'offsetLeft'],
    computed: {
        left() {
            return this.col.left - this.offsetLeft;
        },
        width() {
            return this.col.width;
        },
        displayName() {
            return this.col.displayName;
        },
        active() {
            return this.col.activeState;
        }
    },
    methods: {

    }
};
</script>
<style type="text/css">
</style>