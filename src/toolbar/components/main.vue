<template>
<div class="tools">
    <div class="toolBar">
        <div class="menu-container">
            <ul>
                <!-- <tool-panel title="撤销">
                    <undo></undo>
                </tool-panel> -->
               <!--  <tool-panel title="剪切板">
                    <clip/>
                </tool-panel> -->
                <panel title="字体">
                    <font/>
                </panel>
                <panel title="对齐方式">
                    <align/>
                </panel>
                <panel title="数字">
                    <format/>
                </panel>
                <panel title="合并拆分">
                    <merge/>
                </panel>
                <panel title="自动换行">
                    <word-wrap/>
                </panel>
                <panel title="视图">
                    <frozen/>
                </panel>
                <panel title="隐藏">
                    <hide/>
                </panel>
                <panel  title="行列">
                    <rowcol/>
                </panel>
                <panel  title="批注">
                    <comment/>
                </panel>
            </ul>
        </div>
    </div>
</div>
</template>
<script type="text/javascript">
import Panel from './panel.vue'
import Font from './font.vue'
import Frozen from './frozen.vue'
import Align from './align.vue'
import Merge from './merge.vue'
import Format from './format.vue'
import Rowcol from './rowcol.vue'
import Hide from './hide.vue'
// import Undo from './undo.vue'
// import Clip from './clip.vue'
import Comment from './comment.vue'
import WordWrap from './wordwrap.vue'
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
        Merge,
        Rowcol,
        Hide,
        // Undo,
        // Clip,
        Format,
        WordWrap,
        Comment
    },
    mounted() {
        document.getElementsByTagName('body')[0]
            .addEventListener('click',
                function(e) {
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
    }
}
</script>
<style type="text/css">
    .menu-container{
        padding-top: 1px;
        padding-left: 2px;
    }
</style>