<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-transverse">
            <span class="ico-section"
                  data-value="top"
                  data-struct="content.alignCol"
                  :class="{ active: activeProps.alignCol === 'top' }"
                  @click="setAlignCol">
                    <span class="fui-cf-ico ico-aligntop"></span>
            </span>
            <span class="ico-section"
                  data-value="middle"
                  data-struct="content.alignCol"
                  :class="{active: activeProps.alignCol === 'middle'}"
                  @click="setAlignCol">
                    <span class="fui-cf-ico ico-alignmiddle"></span>
            </span>
            <span class="ico-section"
                  data-value="bottom"
                  data-struct="content.alignCol"
                  :class="{active: activeProps.alignCol === 'bottom'}"
                  @click="setAlignCol">
                    <span class="fui-cf-ico ico-alignbottom"></span>
            </span>
        </div>
        <div class="fui-transverse">
            <span class="ico-section"
                  data-value="left"
                  data-struct="content.alignRow"
                  :class="{ active: activeProps.alignRow === 'left' }"
                  @click="setAlignRow">
                    <span class="fui-cf-ico ico-alignleft"></span>
            </span>
            <span class="ico-section"
                  data-value="center"
                  data-struct="content.alignRow"
                  :class="{ active: activeProps.alignRow === 'center' }"
                  @click="setAlignRow">
                    <span class="fui-cf-ico ico-aligncenter"></span>
            </span>
            <span class="ico-section"
                  data-value="right"
                  data-struct="content.alignRow"
                  :class="{ active: activeProps.alignRow === 'right' }"
                  @click="setAlignRow">
                    <span class="fui-cf-ico ico-alignright"></span>
            </span>
        </div>
    </div>
</div>
</template>

<script>
import {
    pathToStruct
} from '../../tools/format'
function activeStatus(env) {
    let cell = env.$store.getters['activeCell']()
    if (cell == null) {
        cell = env.$store.getters['templateCell']
    }
    return cell
}
export default {
    computed: {
        activeProps() {
            let cell = activeStatus(this)
            let content = cell.content
            return {
                alignRow: content.alignRow,
                alignCol: content.alignCol
            }
        }
    },
    methods: {
        setAlignRow(e) {
            let el = e.currentTarget
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'alignRow',
                propStruct
            })
        },
        setAlignCol(e) {
            let el = e.currentTarget
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'alignCol',
                propStruct
            })
        }
    }
}
</script>