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
    A_CELLS_MERGE,
    A_CELLS_SPLIT
} from '../../store/action-types'
export default {
    computed: {
        hasMerge() {
            return this.$store.getters.hasMergeCell()
        }
    },
    methods: {
        setMerge() {
            if (this.hasMerge) {
                this.$store.dispatch(A_CELLS_SPLIT)
            } else {
                this.$store.dispatch(A_CELLS_MERGE)
            }
        }
    }
}
</script>

