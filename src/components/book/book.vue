<template>
	<div class="book" :style="{width: width + 'px',height: height + 'px'}">
		<sheet :sheet-width="width" :sheet-height="sheetHeight"></sheet>
		<!-- <tab></tab> -->
	</div>
</template>
<script type="text/javascript">
	import Sheet from '../sheet/sheet.vue';

	export default {
		props: [
			'bookWidth',
			'bookHeight'
		],
		computed: {
			width() {
				return this.bookWidth;
			},
			height() {
				return this.bookHeight;
			},
			sheetHeight() {
				return this.bookHeight - 26;
			},
			tabHeight() {
				return 26;
			}
		},
		components: {
			'sheet': Sheet
		}
	};
</script>

<style type="text/css">
	.book{
		position: relative; 
		overflow: hidden;
	}
</style>