<template>
	<div class="cell" 
		:style="{top: top + 'px', 
				left: left + 'px', 
				width: width + 'px', 
				height: height + 'px'}">
		<div class="cell-content" 
			:style="{background: content.background, 
					fontFamily: content.family, 
					fontSize: content.size + 'px', 
					fontStyle: content.italic && 'italic', 
					color: content.color, textAlign: content.alignRow, 
					textDecoration: content.underline, 
					verticalAlign: content.alignCol}">
			{{content.displayTexts}}
		</div>
	</div>
</template>
<script type="text/javascript">
	export default {
		props: ['item'],
		computed: {
			width() {
				return this.item.physicsBox.width;
			},
			height() {
				return this.item.physicsBox.height;
			},
			top() {
				return this.item.physicsBox.top - 1;
			},
			left() {
				return this.item.physicsBox.left - 1;
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