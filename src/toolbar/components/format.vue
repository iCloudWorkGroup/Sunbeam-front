<template>
<div class="fui-body">
   <div class="fui-body">
        <div class="fui-layout">
            <div class="fui-section fui-alone"
                data-initiator="formats"
                @click="ejectMenu($event, 'formats')"
                 :class="{ active: tool==='formats' }">
                <div class="fui-cf-ico ico-routine fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">文本格式</div>
                    <div class="fui-cf-extend fui-cf-caret"></div>
                </div>
            </div>
        </div>
    </div>
    <formats ref="formats" v-show="tool==='formats'"></formats>
</div>
</template>
<script type="text/javascript">
import {
    unit
} from '../../filters/unit'
import formats from './formats.vue'
import {
    SWITCH_NAME
} from '../store/mutation-type'
import {
    mapGetters
} from '../../lib/vuex.esm'
export default {
    computed: {
        ...mapGetters({
            tool: 'activeTool'
        })
    },
    components: {
        formats
    },
    methods: {
        ejectMenu(e, menuName) {
            let el = e.currentTarget
            let menu = this.$refs[menuName]
            let menuEl
            if (menu != null && (menuEl = menu.$el) != null) {
                menuEl.style.top = unit(el.offsetHeight + el.offsetTop - 1)
                menuEl.style.left = unit(el.offsetLeft)
                this.$store.commit(SWITCH_NAME, menuName)
            }
        },
    }
}
</script>
<style type="text/css">
</style>