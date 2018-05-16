<template>
	<div class="fui-body">
		<div class="fui-layout">
			<div class="fui-transverse"  @click="setAlign" data-type="content.alignRow">
				<span class="ico-section" data-value="top">
					<span class="fui-cf-ico ico-aligntop"></span>
				</span>
				<span class="ico-section" data-value="middle">
					<span class="fui-cf-ico ico-alignmiddle"></span>
				</span>
				<span class="ico-section" data-value="bottom">
					<span class="fui-cf-ico ico-alignbottom"></span>
				</span>
			</div>
			<div class="fui-transverse"  @click="setAlign" data-type="content.alignCol">
				<span class="ico-section" data-value="left">
					<span class="fui-cf-ico ico-alignleft"></span>
				</span>
				<span class="ico-section" data-value="center">
					<span class="fui-cf-ico ico-aligncenter"></span>
				</span>
				<span class="ico-section" data-value="right">
					<span class="fui-cf-ico ico-alignright"></span>
				</span>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import {CELLS_UPDATE} from '../../store/action-types';

	export default {
		props: [
			'activeWidgetId'
		],
		computed: {
			currentState() {
				let currentSheet = this.$store.state.currentSheet,
					sheets = this.$store.state.sheets.list,
					sheet;

				for (let i = 0, len = sheets.length; i < len; i++) {
					sheet = sheets[i];
					if (sheet.alias = currentSheet) {
						break;
					}
				}

				let frozenState = sheet.frozenState;
				return frozenState;
			}
		},
		methods: {
			setAlign(e) {
				let currentTarget = e.currentTarget,
					type = currentTarget.dataset.type,
					target = e.target,
					value;

				value = this.getValue(target, currentTarget);
				if(value === undefined){
					return;
				}
				this.$store.dispatch(CELLS_UPDATE, {
					propNames: type,
					value
				});
			},
			getValue(elem, currentTarget) {
				let value = elem.dataset.value;
				if (value === undefined) {
					if (elem === currentTarget) {
						return;
					} else {
						return this.getValue(elem.parentNode, currentTarget);
					}
				} else {
					return value;
				}
			}
		}
	}
</script>
<style type="text/css">
	
</style>