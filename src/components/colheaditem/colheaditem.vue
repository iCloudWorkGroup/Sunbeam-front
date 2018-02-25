<template>
	<div class="col-head-item" :style="{left: left + 'px',width: width + 'px'}">
		<div class="item">{{displayName}}</div>	
	</div>
</template>
<script type="text/javascript">
	export default {
		props: ['col'],
		computed: {
			left() {
				return this.col.left;
			},
			width() {
				return this.col.width;
			},
			displayName() {
				return this.col.displayName;
			}
		},
		methods: {

		}
	}
</script>
<style type="text/css">
	
</style>