<template>
    <div class="fui-body">
        <div class="fui-transverse">
            <span class="fui-layout">
                <div class="fui-section"
                     data-initiator="hideshow"
                     data-opr="hide"
                     @click="ejectMenu($event, 'hideshow')"
                     :class="{ active: opr==='hide' && tool === 'hideshow'}">
                    <div class="fui-cf-bg-extend2-ico ico-insert fui-cf-alone"></div>
                    <div class="fui-cf-desc">
                        <div class="fui-cf-text">隐藏行列</div>
                        <div class="fui-cf-extend fui-cf-caret"></div>
                    </div>
                </div>
            </span>
            <span class="fui-layout">
                <div class="fui-section"
                     data-initiator="hideshow"
                     data-opr="show"
                     @click="ejectMenu($event, 'hideshow')"
                     :class="{ active: opr==='show' && tool === 'hideshow'}">
                    <div class="fui-cf-bg-extend2-ico ico-delete fui-cf-alone"></div>
                    <div class="fui-cf-desc">
                        <div class="fui-cf-text">取消隐藏</div>
                        <div class="fui-cf-extend fui-cf-caret"></div>
                    </div>
                </div>
            </span>
        </div>
        <hides ref="hideshow" v-show="tool == 'hideshow'" :opr="opr"></hides>
    </div>
</template>
<script type="text/javascript">

// import {
//     mapGetters
// } from '../../lib/vuex.esm'
import Hides from './hides.vue'
import {
    unit
} from '../../filters/unit'

import {
    SWITCH_NAME
} from '../store/mutation-type'
export default {
    data() {
        return {
            opr: ''
        }
    },
    computed: {
        // ...mapGetters({
        //     tool: 'activeTool'
        // }),
        tool() {
            return this.$store.getters.activeTool
        }
    },
    methods: {
        ejectMenu(e, menuName) {
            let el = e.currentTarget
            this.opr = el.dataset.opr
            let menu = this.$refs[menuName]
            let menuEl
            if (menu != null && (menuEl = menu.$el) != null) {
                menuEl.style.top = unit(el.offsetHeight + el.offsetTop - 2)
                menuEl.style.left = unit(el.offsetLeft)
                this.$store.commit(SWITCH_NAME, menuName)
            }
        }
    },
    components: {
        Hides
    }
}
</script>