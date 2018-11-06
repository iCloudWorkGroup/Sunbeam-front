<template>
    <div class="fui-body">
        <span class="fui-layout">
            <div class="fui-section fui-transverse"
                 @click="validation">
                <div class="ico-lock fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">数据验证</div>
                </div>
            </div>
        </span>
    </div>
</template>
<script type="text/javascript">
export default {
    methods: {
        validation() {
            let protect = this.$store.getters.isProtect()
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: true,
                title: '数据验证',
                type: 'validation'
            })
        }
    }
}
</script>
<style type="text/css">
</style>