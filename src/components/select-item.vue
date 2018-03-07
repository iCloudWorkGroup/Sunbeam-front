<template>
	<div class="select-item" @dblclick="edit" :style="styleObject">
		<div class="box">
			<div class="bg"></div>
			<div class="expand"></div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import * as types from '../store/action-types';

	export default {
		props: ['item'],
		computed: {
			styleObject() {
				let left = this.item.physicsBox.left, 
					top = this.item.physicsBox.top,
					width = this.item.physicsBox.width, 
					height = this.item.physicsBox.height;

				if (left === 0) {
					left = left - 1;
					width = width - 1;
				} else {
					width = width - 2;
				}

				if (top === 0) {
					top = top - 1;
					height = height - 1;
				} else {
					height = height - 2;
				}
				return {
					left: left + 'px',
					top: top + 'px',
					width: width + 'px',
					height: height + 'px',
				};
			}
		},
		methods: {
			edit() {
				this.$store.dispatch(types.EDIT_SHOW, {
					type: 'click'
				});
			}
		}
	};
</script>
<style type="text/css">
	.select-item{
		position: absolute;
		border: 2px solid #217346;
		margin: -1px;
		overflow: hidden;
	}
	.select-item .box {
	    position: relative;
	    height: inherit;
	}
	.select-item .box .expand {
	    position: absolute;
	    bottom: -1px;
	    right: -1px;
	    width: 3px;
	    height: 3px;
	    z-index: 2;
	    background: #217346;
	    border: 1px solid #fff;
	    cursor: crosshair;
	}
	.select-item .box .bg {
	    background: #141414;
	    opacity: .24;
	    height: 100%;
	}
	.select-item {
		transition: .2s; 
		-moz-transition: .2s; 
		-webkit-transition: .2s; 
		-o-transition: .2s;
	}
</style>