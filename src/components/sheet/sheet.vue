<template>
	<div class="sheet">
		<table class="cui-grid" cellspacing="0" cellpadding="0" id="table">
			<tbody>
				<tr>
					<td>
						<div class="corner" ref="corner"></div>
					</td>
					<td>
						<col-head :col-head-width="colHeadWidth"></col-head>
					</td>
				</tr>
				<tr>
					<td>
						<row-head :row-head-height="rowHeadHeight"></row-head>
					</td>
					<td>
						<edit :edit-width="editWidth" :edit-height="editHeight"></edit>
					</td>
				</tr>
			</tbody>
		</table>



	</div>
</template>

<script type="text/javascript">
	import config from '../../config';
	import getScrollbarWidth from '../../util/getScrollbarWidth';
	import ColHead from '../colhead/colhead.vue';
	import RowHead from '../rowhead/rowhead.vue';
	import Edit from '../edit/edit.vue';

	export default {
		props: [
			'sheetWidth',
			'sheetHeight'
		],
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
		data() {
			return {
				scrollbarWidth: getScrollbarWidth()
			};
		},
		components: {
			'col-head': ColHead,
			'row-head': RowHead,
			'edit': Edit
		}
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
