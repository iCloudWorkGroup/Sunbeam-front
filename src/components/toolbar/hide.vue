<template>
	<div class="fui-body">
		<span class="fui-layout">
			<div class="fui-section fui-transverse" data-widget="hide" @click="activeWidget">
				<div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
				<div class="fui-cf-desc">
					<div class="fui-cf-text">隐藏</div>
				</div>
			</div>
		</span>
		<span class="fui-layout">
			<div class="fui-section fui-transverse" data-widget="show" @click="activeWidget">
				<div class="fui-cf-extend-ico ico-frozencustomized fui-cf-alone"></div>
				<div class="fui-cf-desc">
					<div class="fui-cf-text">取消隐藏</div>
				</div>
			</div>
		</span>
		<div class="widget" ref="hide"
			v-show="activeWidgetId === 'hide'">
			<div class="widget-panel">
				<ul class="widget-menu frozenBox" style="min-width:220px">
					<li @mousedown.stop="hideRow">
						<span class=" widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">隐藏行</div>
						</span>
					</li>
					<li @mousedown.stop="hideCol">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">隐藏列</div>
						</span>
					</li>
				</ul>
			</div>
		</div>
		<div class="widget" ref="show"
			v-show="activeWidgetId === 'show'">
			<div class="widget-panel">
				<ul class="widget-menu frozenBox" style="min-width:220px">
					<li @mousedown.stop="showRow">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">取消隐藏行</div>
						</span>
					</li>
					<li @mousedown.stop="showCol">
						<span class="widget-ico"></span>
						<span class="widget-content">
							<div class="widget-weight">取消隐藏列</div>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import {
		COLS_HIDE,
		ROWS_HIDE,
		COLS_CANCELHIDE,
		ROWS_CANCELHIDE
	} from '../../store/action-types'

	export default {
		props: [
			'activeWidgetId'
		],
		methods: {
			activeWidget(e) {
				let elem = e.currentTarget
				let widgetId = elem.dataset.widget
				let widget
				let box

				if (!widgetId) {
					return
				}

				box = elem.getBoundingClientRect()
				widget = this.$refs[widgetId]
				widget.style.top = box.top + box.height + 'px'
				widget.style.left = box.left + 'px'
				this.$emit('updateActiveWidgetId', widgetId)
			},
			hideCol() {
				this.$store.dispatch(COLS_HIDE)
				this.$emit('updateActiveWidgetId', '')
			},
			hideRow() {
				this.$store.dispatch(ROWS_HIDE)
				this.$emit('updateActiveWidgetId', '')
			},
			showCol() {
				this.$store.dispatch(COLS_CANCELHIDE)
				this.$emit('updateActiveWidgetId', '')
			},
			showRow() {
				this.$store.dispatch(ROWS_CANCELHIDE)
				this.$emit('updateActiveWidgetId', '')
			}
		}
	}
</script>
<style type="text/css">
</style>