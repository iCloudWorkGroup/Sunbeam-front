<template>
<div class="fui-body">
    <div class="fui-transverse">
        <span class="fui-layout">
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
        </span>
        <span class="fui-layout">
             <div class="fui-transverse">
                <div class="fui-section fui-transverse" id="mergeCell"
                     @click="setMerge">
                    <div class="fui-transverse-model"
                         :class="{ active: hasMerge }">
                        <span class="fui-cf-ico ico-section-ico ico-combincells"></span>
                        <span class="fui-cf-text">合并单元格</span>
                    </div>
                </div>
             </div>
            <div class="fui-transverse">
                <div class="fui-section fui-transverse"
                     @click="setWordWrap">
                    <div class="fui-transverse-model"
                        :class="{active: wordWrapState}">
                        <span class="fui-cf-ico ico-section-ico ico-wordwrap"></span>
                        <span class="fui-cf-text">自动换行</span>
                    </div>
                </div>
             </div>
        </span>
    </div>
</div>
</template>

<script>
import {
    pathToStruct
} from '../../tools/format'
import {
    A_CELLS_MERGE,
    A_CELLS_SPLIT,
    CELLS_WORDWRAP
} from '../../store/action-types'
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
        },
        hasMerge() {
            return this.$store.getters.hasMergeCell()
        },
        wordWrapState() {
            return this.$store.getters.isWordWrapCell()
        },
        mergeFlag() {
            return this.$store.state.oprclick.mergeFlag
        }
    },
    methods: {
        setAlignRow(e) {
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            let el = e.currentTarget
            let structName = el.dataset.struct
            let value = el.dataset.value
            let propStruct = pathToStruct({
                structName,
                value
            })
            if (this.activeProps.alignRow === value) {
                propStruct.content.alignRow = ''
            }
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'alignRow',
                propStruct
            })
        },
        setAlignCol(e) {
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
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
        },
        setMerge() {
            if (!this.mergeFlag) {
                return
            }
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            if (this.hasMerge) {
                this.$store.dispatch(A_CELLS_SPLIT)
            } else {
                this.$store.dispatch(A_CELLS_MERGE)
            }
        },
        setWordWrap() {
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            this.$store.dispatch(CELLS_WORDWRAP)
        }
    }
}
</script>