<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-section fui-alone"
             data-widget="frozen"
             @click="ejectMenu($event, 'frozens')"
             :class="{ active: tool==='frozens' }"
             data-initiator="frozens">
            <div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
            <div class="fui-cf-desc">
                <div class="fui-cf-text">冻结窗口</div>
                <div class="fui-cf-extend fui-cf-caret"></div>
            </div>
        </div>
    </div>
    <frozens
        ref="frozens"
        v-show="tool==='frozens'"/>
</div>
</template>
<script type="text/javascript">
import {
    unit
} from '../../filters/unit'
import {
    mapGetters
} from '../../lib/vuex.esm'
import {
    SWITCH_NAME
} from '../store/mutation-type'
import Frozens from './frozens.vue'
export default {
    computed: {
        ...mapGetters({
            tool: 'activeTool'
        }),
    },
    components: {
        Frozens
    },
    methods: {
        ejectMenu(e, menuName) {
            let el = e.currentTarget
            let menu = this.$refs[menuName]
            let menuEl
            if (menu != null && (menuEl = menu.$el) != null) {
                menuEl.style.top = unit(el.offsetHeight + el.offsetTop)
                menuEl.style.left = unit(el.offsetLeft)
                this.$store.commit(SWITCH_NAME, menuName)
            }
        }
    }
}
</script>