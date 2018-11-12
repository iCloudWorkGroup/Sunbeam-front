<template>
<div :class="toolbarSelector" :id="toolbarSelector">
    <div class="toolBar">
        <div class="menu-container">
            <ul>
                <!-- <tool-panel title="撤销">
                    <undo></undo>
                </tool-panel> -->
               <!--  <tool-panel title="剪切板">
                    <clip/>
                </tool-panel> -->
                <panel title="字体" v-show="toolShow.font">
                    <font/>
                </panel>
                <panel title="对齐方式" v-show="toolShow.align">
                    <align/>
                </panel>
                <panel title="数字" v-show="toolShow.format">
                    <format/>
                </panel>
                <panel title="视图" v-show="toolShow.frozen">
                    <frozen/>
                </panel>
                <panel title="隐藏" v-show="toolShow.hide">
                    <hide/>
                </panel>
                <panel  title="行列" v-show="toolShow.rowcol">
                    <rowcol/>
                </panel>
                <panel  title="批注" v-show="toolShow.comment">
                    <comment/>
                </panel>
                <!--<panel  title="锁定" v-show="toolShow.protect">-->
                    <!--<protect/>-->
                <!--</panel>-->
                <panel  title="数据" v-show="toolShow.validation">
                    <Validation/>
                </panel>
            </ul>
        </div>
    </div>
    <div class="sheets-shadow"
         v-show="show"
        @click="closePrompt"></div>
</div>
</template>
<script type="text/javascript">
import Panel from './panel.vue'
import Font from './font.vue'
import Frozen from './frozen.vue'
import Align from './align.vue'
import Format from './format.vue'
import Rowcol from './rowcol.vue'
import Hide from './hide.vue'
import Validation from './validation.vue'
// import Protect from './protect.vue'
// import Undo from './undo.vue'
// import Clip from './clip.vue'
import Comment from './comment.vue'
import '../../css/toolbar.css'
import '../../css/widget.css'
import {
    SWITCH_NAME
} from '../store/mutation-type'
export default {
    components: {
        Panel,
        Font,
        Frozen,
        Align,
        Rowcol,
        Hide,
        // Undo,
        // Clip,
        Format,
        Comment,
        Validation,
        // Protect
    },
    computed: {
        toolbarSelector() {
            return this.$store.state.toolbarSelector.replace(/\.|\#/, '')
        },
        toolShow() {
            return this.$store.state.toolbar.toolShow
        },
        show() {
            return this.$store.state.sheets.prompt.show
        }
    },
    mounted() {
        document.getElementsByTagName('body')[0]
            .addEventListener('click',
                function(e) {
                    let protect = this.$store.getters.isProtect()
                    if (protect) {
                        return
                    }
                    let el = e.target
                    let activeName = el.dataset.initiator
                    if (activeName == null) {
                        /**
                         * 只进行两次向上查找，找不到就结束
                         */
                        let searchTime = 2
                        el = e.target.parentNode
                        while (searchTime !== 0) {
                            activeName = el.dataset && el.dataset.initiator
                            if (activeName == null) {
                                el = el.parentNode
                                searchTime -= 1
                            } else {
                                return
                            }
                        }
                    }
                    if (activeName == null) {
                        this.$store.commit(SWITCH_NAME, null)
                        return
                    }
                    if (activeName !== this.$store.getters['activeTool']) {
                        this.$store.commit(SWITCH_NAME, activeName)
                    }
                }.bind(this))
    },
    methods: {
        closePrompt() {
            this.$store.commit('M_UPDATE_PROMPT', {
                texts: '',
                show: false,
                type: ''
            })
        }
    }
}
</script>
<style type="text/css">
    .menu-container{
        padding-top: 1px;
        padding-left: 2px;
    }
</style>