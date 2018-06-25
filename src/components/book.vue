<template>
    <div class="app"
         style="position:absolute;left:0;right:0;top:0;bottom:0;">
        <toolbar></toolbar>
        <div class="book"
             @mouseup="getFocus"
             :style="{ width: width + 'px',
                height: height + 'px'}">
            <sheet :sheet-width="width"
                   :sheet-height="sheetHeight"></sheet>
            <!-- <tab></tab> -->
        </div>
    </div>
</template>
<script type="text/javascript">
import Toolbar from './toolbar/toolbar.vue'
import Sheet from './sheet.vue'
import cache from '../tools/cache'
import config from '../config'
import {
    UPDATE_MOUSESTATE,
    UPDATE_FOCUSSTATE
} from '../store/mutation-types'
import {
    LOCATE
} from '../tools/constant'
export default {
    props: ['focusState'],
    computed: {
        width() {
            return this.bookWidth
        },
        height() {
            return this.bookHeight
        },
        sheetHeight() {
            return this.bookHeight - 26
        },
        tabHeight() {
            return 26
        }
    },
    components: {
        Toolbar,
        Sheet
    },
    created() {
        this.width = cache.rootEl.offsetWidth
        console.log(document.querySelector('#app'))
        this.height = cache.rootEl.offsetHeight - config.toolbarHeight
    },
    mounted() {
        let self = this
        document.addEventListener('mouseup', function() {
            self.$store.commit(UPDATE_MOUSESTATE, {
                state: LOCATE
            })
        }, false)
    },
    methods: {
        getFocus() {
            this.$store.commit(UPDATE_FOCUSSTATE, false)
        }
    }
}
</script>
<style type="text/css">
.book {
    position: relative;
    overflow: hidden;
    z-index: 0;
}
</style>