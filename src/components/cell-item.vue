<template>
	<div class="cell" :style="physicsBoxStyle">
        <div class="cell-content" :style="contentStyle">
			{{texts}}
		</div>
	</div>
</template>
<script type="text/javascript">
export default {
    props: ['item'],
    computed: {
    	contentStyle(){
    		let content = this.item.content;
    		return {
				background: content.background, 
				fontFamily: content.family, 
				fontSize: content.size + 'px', 
				fontStyle: content.italic && 'italic', 
				color: content.color, textAlign: content.alignRow, 
				textDecoration: content.underline, 
				verticalAlign: content.alignCol
    		}
    	},
    	physicsBoxStyle(){
    		let physicsBox = this.item.physicsBox;
			return {
				top: physicsBox.top - 1 + 'px',
				left: physicsBox.left - 1 + 'px',
				width: physicsBox.width + 'px',
				height: physicsBox.height + 'px'
			}
    	},
    	texts(){
    		return this.item.content.texts;
    	}
    }
};
</script>
<style type="text/css">
	.cell {
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