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
				<tool-panel  title="字体">
					<font 
						:active-widget-id="activeWidgetId"
						 @updateActiveWidgetId = "updateActiveWidgetId">	
					</font>
				</tool-panel>
			</ul>
			<ul id="reviewTool" v-show="activeTabId === 'reviewTool'">
			</ul>
		</div>
	</div>
</template>
<script type="text/javascript">
	import ToolPanel from './toolpanel.vue';
	import Font from './font.vue';
	import '../../css/toolbar.css';
	import '../../css/widget.css';

	export default {
		data() {
			return {
				activeTabId: '',
				activeWidgetId: ''
			}
		},
		components: {
			ToolPanel,
			Font
		},
		computed: {

		},
		mounted() {
			this.activeTabId = this.$refs.initTab.dataset.tabId;
			document.addEventListener('mousedown', () => {
				this.activeWidgetId = '';
			}, false);
		},
		methods: {
			switchTabs(e) {
				let elem = e.target,
					tabId = elem.dataset.tabId;
				this.activeTabId = tabId;
			},
			updateActiveWidgetId(val) {
				this.activeWidgetId = val;
			}
		}
	}
</script>
<style type="text/css">
	
</style>