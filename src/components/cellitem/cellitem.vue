<template>
	<div class="cell" :style="{top: physicsBox.top - 1 + 'px', left: physicsBox.left - 1 + 'px', width: physicsBox.width + 'px', height: physicsBox.height + 'px'}">
		<div class="cell-content" :style="{background: content.background, fontFamily: content.family, fontFamily: content.family, fontSize: content.size + 'px', fontStyle: content.italic && 'italic', color: content.color, textAlign: content.alignRow, textDecoration: content.underline, verticalAlign: content.alignCol}">{{content.displayTexts}}</div>
	</div>
</template>
<script type="text/javascript">
	export default {
		props: ['item'],
		computed:{
			physicsBox() {
				return this.item.physicsBox;
			},
			content() {
				return this.item.content;
			}
		}
	};
</script>
<style type="text/css">
	.cell{
		position: absolute;
		overflow: hidden;
		cursor: default;
		border: 1px solid transparent;
	}
	.cell-content {
		display: table-cell;
		height: inherit;
		width: inherit;
	}
</style>