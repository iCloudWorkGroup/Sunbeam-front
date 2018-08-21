<template>
    <div class="fui-body">
        <div class="fui-layout">
            <div class="fui-transverse">
                <span class="fui-layout" >
                    <div class="fui-section fui-alone" data-widget="insdel" @click="ejectMenu($event, 'insdel')" :title="tool">
                        <div class="fui-cf-bg-extend2-ico ico-insert fui-cf-alone"></div>
                        <div class="fui-cf-desc">
                            <div class="fui-cf-text">&nbsp;&nbsp;插入&nbsp;&nbsp;</div>
                            <div class="fui-cf-extend caret"></div>
                        </div>
                    </div>
                </span>
                <span class="fui-layout">
                    <div class="fui-section fui-alone" data-widget="insdel" @click="ejectMenu($event, 'insdel')">
                        <div class="fui-cf-bg-extend2-ico ico-delete fui-cf-alone"></div>
                        <div class="fui-cf-desc">
                            <div class="fui-cf-text">&nbsp;&nbsp;{{tool}}&nbsp;</div>
                            <div class="fui-cf-extend caret"></div>
                        </div>
                    </div>
                </span>
            </div>
        </div>
        <ins-del ref="insdel" v-show="tool == 'insdel'"></ins-del>
    </div>
</template>
<script type="text/javascript">

// import {
//     mapGetters
// } from '../../lib/vuex.esm'
import InsDel from './insertdelete.vue'
import {
    unit
} from '../../filters/unit'

import {
    SWITCH_NAME
} from '../store/mutation-type'
export default {
    computed: {
        // ...mapGetters({
        //     tool: 'activeTool'
        // }),
        tool() {
            console.log(this.$store.getters.activeTool)
            return this.$store.getters.activeTool
        }
    },
    methods: {
        ejectMenu(e, menuName) {
            let el = e.currentTarget
            let menu = this.$refs[menuName]
            let menuEl
            if (menu != null && (menuEl = menu.$el) != null) {
                menuEl.style.top = unit(el.offsetHeight + el.offsetTop)
                menuEl.style.left = unit(el.offsetLeft)
                console.log(1)
                this.$store.commit(SWITCH_NAME, menuName)
            }
        }
    },
    components: {
        InsDel
    }
}
</script>