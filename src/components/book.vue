<template>
    <div class="book" 
        :width="width + 'px'" 
        :style="{ width: width + 'px', 
            height: height + 'px'}">
        <sheet :sheet-width="width" :sheet-height="sheetHeight"></sheet>
        <!-- <tab></tab> -->
    </div>
</template>
<script type="text/javascript">
import Sheet from './sheet.vue';

export default {
    props: [
        'bookWidth',
        'bookHeight',
        'focusState'
    ],
    computed: {
        width() {
            return this.bookWidth;
        },
        height() {
            return this.bookHeight;
        },
        sheetHeight() {
            return this.bookHeight - 26;
        },
        tabHeight() {
            return 26;
        }
    },
    components: {
        Sheet
    }
};
</script>
<style type="text/css">
.book {
    position: relative;
    overflow: hidden;
    z-index: 0;
}
</style>