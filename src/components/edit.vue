<template>
    <div class="edit scroll-box" :style="{
    width: width + 'px', 
    height: height + 'px'}">
        <edit-panel></edit-panel>
    </div>
</template>
<script type="text/javascript">
import EditPanel from './edit-panel.vue';

export default {
    props: ['editWidth', 'editHeight'],
    computed: {
        width() {
            return this.editWidth;
        },
        height() {
            return this.editHeight;
        }
    },
    components: {
        EditPanel
    }
};
</script>
<style type="text/css">
.scroll-box {
    overflow: auto;
}
</style>