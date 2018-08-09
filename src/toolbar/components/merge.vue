<template>
<div class="fui-body">
    <span class="fui-layout">
        <div class="fui-section fui-transverse"
            @click="setMerge">
            <div class="fui-transverse-model"
                :class="{ active: hasMerge }">
                <span class="fui-cf-ico ico-section-ico ico-combincells"></span>
                <span class="fui-cf-text">合并单元格</span>
            </div>
        </div>
    </span>
</div>
</template>
<script>
import {
    CELLS_HANDLEMERGE
} from '../../store/action-types'
export default {
    computed: {
        hasMerge() {
            return this.$store.getters.hasMergeCell
        }
    },
    methods: {
        setMerge() {
            this.$store.dispatch(CELLS_HANDLEMERGE)
        }
    }
}
</script>

