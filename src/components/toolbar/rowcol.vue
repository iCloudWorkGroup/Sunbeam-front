<template>
	<div class="fui-body">
		<span class="fui-layout">
			<div class="fui-section fui-alone" data-widget="insert" @click="activeWidget">
				<div class="fui-cf-bg-extend2-ico ico-insert fui-cf-alone"></div>
				<div class="fui-cf-desc">
					<div class="fui-cf-text">　插入　</div>
					<div class="fui-cf-extend caret"></div>
				</div>
			</div>
		</span>
		<span class="fui-layout">
			<div class="fui-section fui-alone" data-widget="delete" @click="activeWidget">
				<div class="fui-cf-bg-extend2-ico ico-delete fui-cf-alone"></div>
				<div class="fui-cf-desc">
					<div class="fui-cf-text">　删除　</div>
					<div class="fui-cf-extend caret"></div>
				</div>
			</div>
		</span>
		<div class="widget" ref="insert"
			v-show="activeWidgetId === 'insert'">
			<div class="widget-panel">
				<ul class="widget-menu frozenBox" style="min-width:220px">
					<li @mousedown.stop="insertRow">
						<span class=" widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">插入工作表行</div>
						</span>
					</li>
					<li @mousedown.stop="insertCol">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">插入工作表列</div>
						</span>
					</li>
				</ul>
			</div>
		</div>
		<div class="widget" ref="delete" 
			v-show="activeWidgetId === 'delete'">
			<div class="widget-panel" @mousedown.stop="setAction">
				<ul class="widget-menu frozenBox" style="min-width:220px">
					<li @mousedown.stop="deleteRow">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">删除工作表行</div>
						</span>
					</li>
					<li @mousedown.stop="deleteCol">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">删除工作表列</div>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import {
		COLS_DELETECOL,
		COLS_INSERTCOL,
		ROWS_DELETEROW,
		ROWS_INSERTROW
	} from '../../store/action-types';

	export default {
		props: [
			'activeWidgetId'
		],
		methods: {
			activeWidget(e) {
				let elem = e.currentTarget,
					widgetId = elem.dataset.widget,
					widget,
					box;

				if (!widgetId) {
					return;
				}

				box = elem.getBoundingClientRect();
				widget = this.$refs[widgetId];
				widget.style.top = box.top + box.height + 'px';
				widget.style.left = box.left + 'px';
				this.$emit('updateActiveWidgetId', widgetId);
			},
			insertCol() {
				this.$store.dispatch(COLS_INSERTCOL);
				this.$emit('updateActiveWidgetId', '');
			},
			insertRow() {
				this.$store.dispatch(ROWS_INSERTROW);
				this.$emit('updateActiveWidgetId', '');
			},
			deleteCol() {
				this.$store.dispatch(COLS_DELETECOL);
				this.$emit('updateActiveWidgetId', '');
			},
			deleteRow() {
				this.$store.dispatch(ROWS_DELETEROW);
				this.$emit('updateActiveWidgetId', '');
			},
		}
	}
</script>
<style type="text/css">
	
</style>