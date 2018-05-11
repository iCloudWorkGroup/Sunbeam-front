<template>
	<li class="fui-group">	
		<span class="fui-container">
			<div class="fui-body">
				<slot></slot>
			</div>
			<div class="fui-title">{{title}}</div>
		</span>
		<span class="fui-separator"></span>
	</li>
</template>
<script type="text/javascript">
	export default {
		props: ['title']
	}
</script>