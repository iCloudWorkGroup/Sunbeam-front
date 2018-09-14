<template>
    <div class="fui-body">
        <div class="fui-transverse">
            <span class="fui-layout">
                <div class="fui-section"
                      data-initiator="insdel"
                      data-opr="insert"
                      @click="ejectMenu($event, 'insdel')" >
                    <div class="fui-cf-bg-extend2-ico ico-insert fui-cf-alone"></div>
                    <div class="fui-cf-desc">
                        <div class="fui-cf-text">插入工作表</div>
                        <div class="fui-cf-extend fui-cf-caret"></div>
                    </div>
                </div>
            </span>
            <span class="fui-layout">
                <div class="fui-section"
                     data-initiator="insdel"
                     data-opr="delete"
                     @click="ejectMenu($event, 'insdel')">
                    <div class="fui-cf-bg-extend2-ico ico-delete fui-cf-alone"></div>
                    <div class="fui-cf-desc">
                        <div class="fui-cf-text">删除工作表</div>
                        <div class="fui-cf-extend fui-cf-caret"></div>
                    </div>
                </div>
            </span>
        </div>
        <ins-del ref="insdel" v-show="tool == 'insdel'" :opr="opr"></ins-del>
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
        InsDel
    }
}
</script>