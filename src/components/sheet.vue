<template>
	<div class="sheet">
		<table class="cui-grid" cellspacing="0" cellpadding="0" id="table">
			<tbody>
				<tr>
					<td>
						<div class="corner" ref="corner"></div>
					</td>
					<td v-if="colFrozen">
						<col-head 
							:rule="leftRule" 
							:head-width="leftRule.width">	
						</col-head>
					</td>
					<td>
						<col-head
							:rule="mainRule" 
							:scroll-left="scrollLeft" 
							:col-head-width="colHeadWidth">	
						</col-head>
					</td>
				</tr>
				<tr v-if="rowFrozen">
					<td>
						<row-head
							:rule="topRule"
							:head-height="topRule.height"
						></row-head>
					</td>
					<td v-if="colFrozen">
						<edit :rule="cornerRule"
							:edit-width="cornerRule.width" 
							:edit-height="cornerRule.height"
						></edit>
					</td>
					<td>
						<edit :rule="topRule"
							:edit-height="topRule.height"
							:edit-width="colHeadWidth"
							>
						</edit>
					</td>
				</tr>
				<tr>
					<td>
						<row-head 
							:rule="mainRule"
							:scroll-top="scrollTop" 
							:row-head-height="rowHeadHeight">
						</row-head>
					</td>
					<td v-if="rowFrozen">
						<edit
							:edit-height="rowHeadHeight"
							:edit-width="rowFrozen.width"
						></edit>
					</td>
					<td>
						<edit :rule="mainRule"
							:edit-width="editWidth" 
							:edit-height="editHeight"
							@changeScrollTop="changeScrollTop" 
							@changeScrollLeft="changeScrollLeft">	
						</edit>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script type="text/javascript">
	import config from '../config';
	import getScrollbarWidth from '../util/scrollbarWidth';
	import ColHead from './col-head.vue';
	import RowHead from './row-head.vue';
	import Edit from './edit.vue';

	export default {
		props: [
			'sheetWidth',
			'sheetHeight'
		],
		data() {
			return {
				scrollbarWidth: getScrollbarWidth(),
				scrollTop: 0,
				scrollLeft: 0
			};
		},
		computed: {
			rowFrozen(){
				let frozenState = this.$store.getters.getFrozenState;
				return frozenState.rowFrozen;
			},
			colFrozen(){
				let frozenState = this.$store.getters.getFrozenState;
				return frozenState.colFrozen;
			},
			cornerRule() {
				let rules = this.$store.getters.getFrozenState.rules,
					rule;
				rules.forEach(function(item) {
					if (item.type === 'cornerRule') {
						rule = item;
					}
				});
				return item;
			},
			leftRule() {
				let rules = this.$store.getters.getFrozenState.rules,
					rule;
				rules.forEach(function(item) {
					if (item.type === 'leftRule') {
						rule = item;
					}
				});
				return item;
			},
			topRule() {
				let rules = this.$store.getters.getFrozenState.rules,
					rule;
				rules.forEach(function(item) {
					if (item.type === 'topRule') {
						rule = item;
					}
				});
				return item;
			},
			mainRule() {
				let rules = this.$store.getters.getFrozenState.rules,
					rule;
				rules.forEach(function(item) {
					if (item.type === 'mainRule') {
						rule = item;
					}
				});
				return item;
			},
			width() {
				return this.sheetWidth;
			},
			height() {
				return this.sheetHeight;
			},
			colHeadWidth() {
				let frozenState = this.$store.getters.getFrozenState;
					// frozenState.rowFrozen;
				return this.sheetWidth - config.cornerWidth - this.scrollbarWidth;
			},
			rowHeadHeight() {

				return this.sheetHeight - config.cornerHeight - this.scrollbarWidth;
			},
			editWidth() {

				return this.sheetWidth - config.cornerWidth;
			},
			editHeight() {

				return this.sheetHeight - config.cornerHeight;
			}
		},
		components: {
			ColHead,
			RowHead,
			Edit
		},
		methods: {
			changeScrollTop(val){
				this.scrollTop = val;

			},
			changeScrollLeft(val){
				this.scrollLeft = val;
			}
		},
	};
</script>
<style type="text/css">
.sheet {
    position: absolute;
    top: 0;
    left: 0;
}

.corner {
    border-width: 0 1px 1px 0;
    border-color: #bfbfbf;
    border-style: solid;
    height: 19px;
    width: 36px;
}
</style>