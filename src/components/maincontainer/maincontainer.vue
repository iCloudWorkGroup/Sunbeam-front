<template>
	<div class="main-layout">
		<table class="cui-grid" cellspacing="0" cellpadding="0" id="tableContainer">
			<tbody>
				<tr>
					<td>
						<div class="corner" ref="corner"></div>
					</td>
					<td>
						<col-head-container :col-container-width="colContainerWidth"></col-head-container>
					</td>
				</tr>
				<tr>
					<td>
						<row-head-container :row-container-height="rowContainerHeight"></row-head-container>
					</td>
					<td>
						<edit-container :edit-width="editWidth" :edit-Height="editHeight"></edit-container>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script type="text/javascript">
	import config from '../../config';
	import getScrollbarWidth from '../../util/getScrollbarWidth';
	import ColHeadContainer from '../colheadcontainer/colheadcontainer.vue';
	import RowHeadContainer from '../rowheadcontainer/rowheadcontainer.vue';
	import EditContainer from '../editcontainer/editcontainer.vue';

	export default {
		props: [
			'mainWidth',
			'mainHeight'
		],
		computed: {
			width() {
				return this.mainWidth;
			},
			height() {
				return this.mainHeight;
			},
			colContainerWidth() {
				return this.mainWidth - config.cornerWidth;
			},
			rowContainerHeight() {
				return this.mainHeight - config.cornerHeight;
			},
			editWidth() {
				return this.mainWidth - config.cornerWidth - this.scrollbarWidth;
			},
			editHeight(){
				return this.mainWidth - config.cornerHeight - this.scrollbarWidth;
			}
		},
		data() {
			return {
				scrollbarWidth: getScrollbarWidth()
			}
		},
		components:{
			'col-head-container': ColHeadContainer,
			'row-head-container': RowHeadContainer,
			'edit-container': EditContainer
		}
	}
</script>

<style type="text/css">
	.main-layout { position: absolute; bottom: 30px; width:100%; z-index: 99; top: 0px }
	.corner { border-width: 0 1px 1px 0; border-color: #bfbfbf; border-style: solid; height: 19px; width: 36px; }
</style>
