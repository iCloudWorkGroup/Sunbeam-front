<template>
	<div class="sheet">
		<table class="cui-grid" cellspacing="0" cellpadding="0" id="table">
			<tbody>
				<tr>
					<td>
						<div class="corner" ref="corner"></div>
					</td>
					<td>
						<col-head :scroll-left="scrollLeft" :col-head-width="colHeadWidth"></col-head>
					</td>
				</tr>
				<tr>
					<td>
						<row-head :scroll-top="scrollTop" :row-head-height="rowHeadHeight"></row-head>
					</td>
					<td>
						<edit @changeScrollTop="changeScrollTop" 
							@changeScrollLeft="changeScrollLeft"
							:edit-width="editWidth" :edit-height="editHeight"></edit>
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
			width() {
				return this.sheetWidth;
			},
			height() {
				return this.sheetHeight;
			},
			colHeadWidth() {
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