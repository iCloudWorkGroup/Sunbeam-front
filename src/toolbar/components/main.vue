<template>
<div class="tools">
    <div class="toolBar">
        <div class="topBar">
            <div class="file-control">
                <span>文件</span>
            </div>
            <ul class="fui-control-list">
                <li><span>开始</span></li>
                <li><span>审阅</span></li>
                <li><span>下载</span></li>
            </ul>
            <div class="excel-name">
                <div class="textarea">Book Name</div>
            </div>
            <div class="version">Version frontend : 1.0.0</div>
            <div class="version">Version java : 1.0.0</div>
        </div>
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
                <!-- <tool-panel title="文本格式">
                    <format/>
                </tool-panel> -->
                <panel title="合并拆分">
                    <merge/>
                </panel>
                <!-- <tool-panel title="视图">
                    <frozen/>
                </tool-panel>
                <tool-panel title="隐藏">
                    <hide/>
                </tool-panel>  -->
    <!--                 <tool-panel  title="行列">
                    <rowcol/>
                </tool-panel> -->
            </ul>
        </div>
    </div>
</div>
</template>
<script type="text/javascript">
import Panel from './panel.vue'
import Font from './font.vue'
// import Frozen from './frozen.vue'
import Align from './align.vue'
import Merge from './merge.vue'
// import Format from './format.vue'
// import Rowcol from './rowcol.vue'
// import Hide from './hide.vue'
// import Undo from './undo.vue'
// import Clip from './clip.vue'
// import WordWrap from './wordwrap.vue'
import '../../css/toolbar.css'
import '../../css/widget.css'
import {
    SWITCH_NAME
} from '../store/mutation-type'
export default {
    components: {
        Panel,
        Font,
        // Frozen,
        Align,
        Merge,
        // Rowcol,
        // Hide,
        // Undo,
        // Clip,
        // Format,
        // WordWrap
    },
    mounted() {
        document.getElementsByTagName('body')[0]
            .addEventListener('click',
                function(e) {
                    let el = e.target
                    let activeName = el.dataset.initiator
                    if (activeName == null) {
                        el = e.target.parentNode
                        activeName = el.dataset.initiator
                    }
                    if (activeName) {
                        if (activeName !== this.$store.getters['activeTool']) {
                            this.$store.commit(SWITCH_NAME, activeName)
                        }
                        return
                    }
                    this.$store.commit(SWITCH_NAME, null)
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