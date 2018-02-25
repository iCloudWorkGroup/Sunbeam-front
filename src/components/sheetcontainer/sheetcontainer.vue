<template>
	<div class="sheet-container" :style="{width: width + 'px',height: height + 'px'}">
		<main-container :main-width="width" :main-height="height - 26"></main-container>
		<!-- <sheet-list-container></sheet-list-container> -->
	</div>
</template>
<script type="text/javascript">
	import MainContainer from '../maincontainer/maincontainer.vue';

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
			}
		},
		components: {
			'main-container': MainContainer
		}
	}
</script>

<style type="text/css">
	.sheet-container{
		position: relative; 
		height: 100%; 
		overflow: hidden;
	}
</style>