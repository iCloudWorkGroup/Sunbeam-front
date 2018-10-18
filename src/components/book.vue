<template>
    <div :class="rootSelector" :id="rootSelector">
        <div class="book"
             @mousedown="offStatus"
             :style="{ width, height}">
            <sheet></sheet>
            <sheet-sider/>
        </div>
        <prompt-box v-show="show"></prompt-box>
    </div>
</template>
<script type="text/javascript">
import Sheet from './sheet.vue'
import SheetSider from './sheet-sider.vue'
import PromptBox from './prompt-box.vue'
import {
    unit
} from '../filters/unit'
import {
    M_UPDATE_LOAD
} from '../store/mutation-types'

export default {
    data() {
        return {
            // BUG: 暂时使用scroll，需要看实验的边线效果
            // height: unit(document.getElementsByClassName('table')[0].scrollHeight)
            // width: unit(document.getElementsByClassName('table')[0].scrollWidth)
            // height: unit(cache.rootEl.scrollHeight),
            // width: unit(cache.rootEl.scrollWidth)
        }
    },
    components: {
        Sheet,
        SheetSider,
        PromptBox
    },
    computed: {
        rootSelector() {
            return this.$store.state.rootSelector.replace(/\.|\#/, '')
        },
        show() {
            return this.$store.state.sheets.prompt.show
        },
        width() {
            return unit(this.$store.getters.offsetWidth)
        },
        height() {
            return unit(this.$store.getters.offsetHeight)
        },
    },
    beforeDestroy() {
        this.$store.commit(M_UPDATE_LOAD, true)
    },
    mounted() {
        let _this = this
        let timeOutId = -1
        window.onresize = () => {
            if (timeOutId) {
                clearTimeout(timeOutId)
            }
            timeOutId = setTimeout(function () {
                let rootSelector = _this.$store.state.rootSelector
                let offsetWidth = document.querySelector(rootSelector).offsetWidth
                let offsetHeight = document.querySelector(rootSelector).offsetHeight
                _this.$store.commit('M_UPDATE_OFFSETWIDTH', offsetWidth)
                _this.$store.commit('M_UPDATE_OFFSETHEIGHT', offsetHeight)
            }, 100)
        }
        window.onmouseup = () => {
            _this.$store.commit('M_SELECT_UPDATE_MOUSESTATUS', 'LOCATE')
        }
    },
    methods: {
        offStatus(e) {
            if (e.target.getAttribute('class') !== 'edit-frame') {
                let props = this.$store.getters.inputProps
                this.$store.commit('M_INPUT_UPDATE_STATUS', !props.assist.status)
            }
        }
    },
}
</script>
<style type="text/css">
.app {
    /*position:absolute;*/
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