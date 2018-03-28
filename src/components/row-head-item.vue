<template>
    <div class="row-head-item" :class="{active: active}" :style="{
    	top: top + 'px',
    	height: height + 'px'}">
        <div class="item">{{displayName}}</div>
    </div>
</template>
<script type="text/javascript">
export default {
    props: ['row'],
    computed: {
        top() {
            return this.row.top;
        },
        height() {
            return this.row.height;
        },
        displayName() {
            return this.row.displayName;
        },
        active() {
            return this.row.activeState;
        }
    },
    methods: {

    }
};
</script>
<style type="text/css">
</style>