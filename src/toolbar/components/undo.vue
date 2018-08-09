<template>
<div class="fui-body">
    <div class="fui-layout">
        <div class="fui-transverse" @click="redo">
            <div class="ico-section">
                <span class="fui-cf-bg-extend-ico ico-redo"></span>
            </div>
        </div>
        <div class="fui-transverse" @click="undo">
            <div class="ico-section">
                <span class="fui-cf-bg-extend-ico ico-undo"></span>
            </div>
        </div>
    </div>
</div>

</template>

<script type="text/javascript">
import {
    HISTORY_REDO,
    HISTORY_UNDO
} from '../../store/action-types'

export default {
    methods: {
        redo() {
            this.$store.dispatch(HISTORY_REDO)
        },
        undo() {
            this.$store.dispatch(HISTORY_UNDO)
        }
    }
}
</script>