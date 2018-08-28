<template>
    <div class="table">
        <div class="book"
             @mouseup=""
             :style="{ width, height}">
            <sheet></sheet>
            <sheet-sider/>
        </div>
    </div>
</template>
<script type="text/javascript">
import Sheet from './sheet.vue'
import SheetSider from './sheet-sider.vue'
import cache from '../tools/cache'
import {
    unit
} from '../filters/unit'
import {
    // UPDATE_MOUSESTATE,
    UPDATE_FOCUSSTATE
} from '../store/mutation-types'
// import {
//     LOCATE
// } from '../tools/constant'

export default {
    data() {
        return {
            // BUG: 暂时使用scroll，需要看实验的边线效果
            height: unit(cache.rootEl.scrollHeight),
            width: unit(cache.rootEl.scrollWidth)
            // height: unit(cache.rootEl.offsetHeight),
            // width: unit(cache.rootEl.offsetWidth)
        }
    },
    components: {
        Sheet,
        SheetSider
    },
    mounted() {
        // document.addEventListener('mouseup', function() {
        //     self.$store.commit(UPDATE_MOUSESTATE, {
        //         state: LOCATE
        //     })
        // }, false)
    },
    methods: {
        getFocus() {
            this.$store.commit(UPDATE_FOCUSSTATE, false)
        }
    }
}
</script>
<style type="text/css">
.app {
    position:absolute;
    left:0;
    right:0;
    top:0;
    bottom:0;
}
.book {
    position: relative;
    overflow: hidden;
    z-index: 0;
}
</style>