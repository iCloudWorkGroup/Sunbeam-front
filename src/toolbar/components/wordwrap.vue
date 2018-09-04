<template>
<div class="fui-body">
    <span class="fui-layout">
        <div class="fui-section fui-transverse" @click="setWordWrap">
            <div class="fui-transverse-model" :class="{active: wordWrapState}">
                <span class="fui-cf-ico ico-section-ico ico-wordwrap"></span>
                <span class="fui-cf-text">自动换行</span>
            </div>
        </div>
    </span>
</div>
</template>
<script type="text/javascript">
import {
    CELLS_WORDWRAP
} from '../../store/action-types'

export default {
    computed: {
        wordWrapState() {
            return this.$store.getters.isWordWrapCell()
        }
    },
    methods: {
        setWordWrap() {
            this.$store.dispatch(CELLS_WORDWRAP)
        }
    }
}
</script>