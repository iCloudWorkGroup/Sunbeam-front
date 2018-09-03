<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-transverse">
            <span class="section"
                  data-initiator="familys"
                  @click="ejectMenu($event, 'familys')">
                    <span
                    class="fui-transverse-model fui-cf-fontfamily">
                {{ activeProps.family }}
                    </span>
                <span
                class="fui-transverse-model fui-cf-fontfamily-extend active">
                    <span class="caret"></span>
                </span>
            </span>
            <span class="section"
                  data-initiator="sizes"
                  @click="ejectMenu($event, 'sizes')">
                    <span
                        class="fui-transverse-model fui-cf-fontsize">
                        {{ activeProps.size }}
                    </span>
            <span
                class="fui-transverse-model fui-cf-fontsize-extend active">
                <span class="caret"></span>
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
                <span class="ico-section-rightarrow">
                    <span class="caret"></span>
                </span>
            </span>
            <span class="ico-section"
                  title="背景色"
                  data-initiator="backgrounds"
                  @click="ejectMenu($event, 'backgrounds')">
                <span class="fui-cf-ico ico-fillbg ico-section-ico"></span>
                <span class="ico-section-rightarrow">
                    <span class="caret"></span>
                </span>
            </span>
            <span class="ico-section"
                  data-initiator="colors"
                  title="字体颜色"
                  @click="ejectMenu($event, 'colors')">
                <span class="fui-cf-ico ico-fillcolor ico-section-ico"></span>
                <span class="ico-section-rightarrow">
                    <span class="caret"></span>
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
    CELLS_UPDATE,
} from '../../store/action-types'
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
        // areaProps() {
        //     let allSelects = this.$store.getters.allSelects
        //     let activePosi = allSelects[0].activePosi
        //     let cell = this.$store.getters.getCellByAlias({
        //         colAlias: activePosi.colAlias,
        //         rowAlias: activePosi.rowAlias
        //     })

        //     let cellProps = this.$store.getters.getSelectCell()
        //     let family = cellProps.content.family
        //     const font2zh = {
        //         'SimSun': '宋体',
        //         'SimHei': '黑体',
        //         'KaiTi': '楷体'
        //     }
        //     let temp
        //     if ((temp = font2zh[family])) {
        //         cellProps.content.family = temp
        //     }
        //     return cellProps
        // }
    },
    methods: {
        setWeight() {
            let cell = activeStatus(this)
            let propStruct = pathToStruct({
                structName: 'content.weight',
                value: !cell.content.weight
            })
            this.$store.dispatch(CELLS_UPDATE, {
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
            this.$store.dispatch(CELLS_UPDATE, {
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
            this.$store.dispatch(CELLS_UPDATE, {
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
        // activeWidget(e) {
        //     let elem = e.currentTarget
        //     let widgetId = elem.dataset.widget
        //     let widget
        //     let box

        //     if (!widgetId) {
        //         return
        //     }

        //     box = elem.getBoundingClientRect()
        //     widget = this.$refs[widgetId]
        //     widget.style.top = box.top + box.height + 'px'
        //     widget.style.left = box.left + 'px'

        //     this.$emit('updateActiveWidgetId', widgetId)
        // },
        // setAction(e) {
        //     e.stopPropagation()
        //     let currentTarget = e.currentTarget
        //     let type = currentTarget.dataset.type
        //     let target = e.target
        //     let value

        //     value = this.getValue(target, currentTarget)
        //     if (value == null) {
        //         return
        //     }
        //     this.$store.dispatch(CELLS_UPDATE, {
        //         propNames: type,
        //         value
        //     })
        //     this.$emit('updateActiveWidgetId', '')
        // },
        // getValue(elem, currentTarget) {
        //     let value = elem.dataset.value
        //     if (value == null) {
        //         if (elem === currentTarget) {
        //             return
        //         } else {
        //             return this.getValue(elem.parentNode, currentTarget)
        //         }
        //     } else {
        //         return value
        //     }
        // },
        // setBorder(e) {
        //     e.stopPropagation()
        //     let currentTarget = e.currentTarget
        //     let target = e.target
        //     let value

        //     value = this.getValue(target, currentTarget)
        //     if (value == null) {
        //         return
        //     }
        //     this.$store.dispatch(CELLS_UPDATE_BORDER, {
        //         value
        //     })
        //     this.$emit('updateActiveWidgetId', '')
        // },
        // reverseAction(e) {
        //     e.stopPropagation()
        //     let type = e.currentTarget.dataset.type

        //     this.$store.dispatch(CELLS_UPDATE, {
        //         propNames: type
        //     })
        //     this.$emit('updateActiveWidgetId', '')
        // }
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