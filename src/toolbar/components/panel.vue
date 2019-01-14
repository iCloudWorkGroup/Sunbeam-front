<template>
<li class="fui-group">
    <span class="fui-container">
            <slot></slot>
            <div class="fui-title" v-if="title !== ''">{{title}}</div>
        </span>
    <span class="fui-separator"></span>
</li>
</template>
<script>
export default {
    props: ['title']
}
</script>