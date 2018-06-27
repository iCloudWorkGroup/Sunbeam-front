<template>
<div class="fui-body">
    <span class="fui-layout">
        <div class="fui-section fui-alone">
            <div class="fui-cf-ico ico-routine fui-cf-alone"></div>
            <div class="fui-cf-desc">
                <div class="fui-cf-text">文本格式</div>
                <div class="fui-cf-extend caret"></div>
            </div>
        </div>
    </span>
    <button @click="setFormat('G')">routine</button>
    <button @click="setFormat('@')">text</button>
    <button @click="setFormat('0.00#,##')">number</button>
    <button @click="setFormat('yyyy-mm-dd')">date</button>
    <button @click="setFormat('$0.00#,##')">curreny</button>
    <button @click="setFormat('#,##%')">percent</button>
</div>
</template>
<script>
import {
    CELLS_FORMAT
} from '../../store/action-types'
export default {
    methods: {
        setFormat(reg) {
            this.$store.dispatch(CELLS_FORMAT, reg)
        }
    }
}
</script>