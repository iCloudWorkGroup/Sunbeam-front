<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-transverse">
            <span class="section"
                  data-initiator="familys"
                  @click="ejectMenu($event, 'familys')"
                  :class="{ active: tool==='familys' }">
                    <span class="fui-transverse-model fui-cf-fontfamily">
                        {{ activeProps.family }}
                    </span>
                <span
                class="fui-transverse-model fui-cf-fontfamily-extend active"
                data-initiator="familys">
                    <span class="fui-cf-caret"></span>
                </span>
            </span>
            <span class="section"
                  data-initiator="sizes"
                  @click="ejectMenu($event, 'sizes')"
                  :class="{ active: tool==='sizes' }">
                    <span
                        class="fui-transverse-model fui-cf-fontsize">
                        {{ activeProps.size }}
                    </span>
            <span
                class="fui-transverse-model fui-cf-fontsize-extend active"
                data-initiator="sizes">
                <span class="fui-cf-caret"></span>
            </span>
            </span>
        </div>
        <div class="fui-transverse">
            <span class="ico-section"
                  :class="{ active: activeProps.weight }"
                  title="加粗"
                  @click="setWeight">
                    <span class="fui-cf-ico ico-weight"></span>
            </span>
            <span class="ico-section"
                  title="斜体"
                  :class="{ active: activeProps.italic }"
                  @click="setItalic">
                    <span class="fui-cf-ico ico-italic"></span>
            </span>
            <span class="ico-section"
                  title="下划线"
                  :class="{ active: activeProps.underline }"
                  @click="setUnderline">
                    <span class="fui-cf-ico ico-underline"></span>
            </span>
            <span class="ico-section"
                  title="边框"
                  data-initiator="borders"
                  @click="ejectMenu($event, 'borders')">
                <span class="fui-cf-ico ico-borderbottom ico-section-ico"></span>
                <span class="ico-section-rightarrow"
                      data-initiator="borders">
                    <span class="fui-cf-caret"></span>
                </span>
            </span>
            <span class="ico-section"
                  title="背景色"
                  data-initiator="backgrounds"
                  @click="ejectMenu($event, 'backgrounds')"
                  :class="{ active: tool==='backgrounds' }">
                <span class="fui-cf-ico ico-fillbg ico-section-ico"></span>
                <span class="ico-section-rightarrow"
                      data-initiator="backgrounds">
                    <span class="fui-cf-caret"></span>
                </span>
            </span>
            <span class="ico-section"
                  data-initiator="colors"
                  title="字体颜色"
                  @click="ejectMenu($event, 'colors')"
                  :class="{ active: tool==='colors' }">
                <span class="fui-cf-ico ico-fillcolor ico-section-ico"></span>
                <span class="ico-section-rightarrow"
                      data-initiator="colors">
                    <span class="fui-cf-caret"></span>
                </span>
            </span>
        </div>
    </div>
    <sizes
        ref="sizes"
        v-show="tool==='sizes'"/>
    <borders
        ref="borders"
        v-show="tool==='borders'"/>
    <familys
        ref="familys"
        v-show="tool==='familys'"/>
    <colors
        ref="colors"
        v-show="tool==='colors'"/>
    <backgrounds
        ref="backgrounds"
        v-show="tool==='backgrounds'"/>

</div>
</template>
<script type="text/javascript">
import {
    mapGetters
} from '../../lib/vuex.esm'
import Sizes from './sizes.vue'
import Borders from './borders.vue'
import Familys from './familys.vue'
import Colors from './colors.vue'
import Backgrounds from './backgrounds.vue'
import {
    unit
} from '../../filters/unit'
import {
    pathToStruct
} from '../../tools/format'
import {
    SWITCH_NAME
} from '../store/mutation-type'
function activeStatus(env) {
    let cell = env.$store.getters['activeCell']()
    if (cell == null) {
        cell = env.$store.getters['templateCell']
    }
    return cell
}
export default {
    computed: {
        ...mapGetters({
            tool: 'activeTool'
        }),
        activeProps() {
            let cell = activeStatus(this)
            let content = cell.content
            return {
                weight: content.weight,
                italic: content.italic,
                underline: content.underline,
                family: content.family,
                size: content.size
            }
        }
    },
    methods: {
        setWeight() {
            let cell = activeStatus(this)
            let propStruct = pathToStruct({
                structName: 'content.weight',
                value: !cell.content.weight
            })
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'weight',
                propStruct
            })
        },
        setItalic() {
            let cell = activeStatus(this)
            let propStruct = pathToStruct({
                structName: 'content.italic',
                value: !cell.content.italic
            })
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'italic',
                propStruct
            })
        },
        setUnderline() {
            let cell = activeStatus(this)
            let propStruct = pathToStruct({
                structName: 'content.underline',
                value: Number(!cell.content.underline)
            })
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'underline',
                propStruct
            })
        },
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
    },
    components: {
        Sizes,
        Borders,
        Familys,
        Colors,
        Backgrounds
    }
}
</script>