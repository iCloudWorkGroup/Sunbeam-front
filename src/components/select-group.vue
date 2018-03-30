<template>
    <div class="select-group">
        <select-item v-for="item in selectList" :key="item.alias" :item="item" :frozenRule="frozenRule">
        </select-item>
    </div>
</template>
<script type="text/javascript">
import SelectItem from './select-item.vue';

export default {
    props: ['frozenRule'],
    computed: {
        selectList() {
            return this.$store.getters.selectList;
        }
    },
    components: {
        SelectItem
    }
};
</script>
<style type="text/css">
.select-group {
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
}
</style>