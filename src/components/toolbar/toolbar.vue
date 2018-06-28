<template>
    <div class="toolBar">
        <div class="topBar">
            <div class="file-control">
                <span>文件</span>
            </div>
            <ul class="fui-control-tabs" @click.prevent="switchTabs">
                <li><span ref="initTab" data-tab-id="homeTool" :class="{active:activeTabId === 'homeTool'}">开始</span></li>
                <li><span data-tab-id="reviewTool" :class="{active:activeTabId === 'reviewTool'}">审阅</span></li>
            </ul>
            <div class="download">
                <span>下载</span>
            </div>
            <div class="excel-name">
                <div class="textarea">Book Name</div>
            </div>
            <div class="version">Version frontend : 1.0.0</div>
            <div class="version">Version java : 1.0.0</div>
        </div>
        <div class="menu-container">
            <ul id="homeTool" v-show="activeTabId === 'homeTool'">
                <tool-panel  title="撤销">
                    <undo></undo>
                </tool-panel>
                <tool-panel  title="剪切板">
                    <clip/>
                </tool-panel>
                <tool-panel  title="字体">
                    <font
                        :active-widget-id="activeWidgetId"
                        @updateActiveWidgetId = "updateActiveWidgetId">
                    </font>
                </tool-panel>
                <tool-panel  title="对齐方式">
                    <align></align>
                </tool-panel>
                <tool-panel  title="合并拆分">
                    <merge></merge>
                </tool-panel>
                <tool-panel  title="文本格式">
                    <format
                        :active-widget-id="activeWidgetId"
                        @updateActiveWidgetId = "updateActiveWidgetId"></format>
                </tool-panel>
                <tool-panel  title="行列">
                    <rowcol :active-widget-id="activeWidgetId"
                        @updateActiveWidgetId = "updateActiveWidgetId"></rowcol>
                </tool-panel>
            </ul>
            <ul id="reviewTool" v-show="activeTabId === 'reviewTool'">
                <tool-panel  title="视图">
                    <frozen
                        :active-widget-id="activeWidgetId"
                        @updateActiveWidgetId = "updateActiveWidgetId">
                    </frozen>
                </tool-panel>
                <tool-panel  title="隐藏">
                    <hide
                        :active-widget-id="activeWidgetId"
                        @updateActiveWidgetId = "updateActiveWidgetId">
                    </hide>
                </tool-panel>
            </ul>
        </div>
    </div>
</template>
<script type="text/javascript">
import ToolPanel from './toolpanel.vue'
import Font from './font.vue'
import Frozen from './frozen.vue'
import Align from './align.vue'
import Merge from './merge.vue'
import Rowcol from './rowcol.vue'
import Hide from './hide.vue'
import Undo from './undo.vue'
import Clip from './clip.vue'
import Format from './format.vue'
import '../../css/toolbar.css'
import '../../css/widget.css'

export default {
    data() {
        return {
            activeTabId: '',
            activeWidgetId: ''
        }
    },
    components: {
        ToolPanel,
        Font,
        Frozen,
        Align,
        Merge,
        Rowcol,
        Hide,
        Undo,
        Clip,
        Format
    },
    mounted() {
        this.activeTabId = this.$refs.initTab.dataset.tabId
        document.addEventListener('mousedown', () => {
            this.activeWidgetId = ''
        }, false)
    },
    methods: {
        switchTabs(e) {
            let elem = e.target
            let tabId = elem.dataset.tabId
            this.activeTabId = tabId
        },
        updateActiveWidgetId(val) {
            this.activeWidgetId = val
        }
    }
}
</script>
<style type="text/css">
    .toolBar{
        position: relative;
        z-index:999;
    }
    .menu-container{
        padding-top: 1px;
        padding-left: 2px;
    }
</style>