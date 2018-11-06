<template>
    <div class="fui-body">
        <span class="fui-layout">
            <div class="fui-section fui-transverse"
                 @click="lock">
                <div class="ico-lock fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">锁定单元格</div>
                </div>
            </div>
        </span>
        <span class="fui-layout">
            <div class="fui-section fui-transverse"
                 @click="protect">
                <div class="ico-lock fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">保护工作簿</div>
                </div>
            </div>
        </span>
    </div>
</template>
<script type="text/javascript">
export default {
    methods: {
        protect() {
            let protect = this.$store.getters.isProtect()
            let title
            if (protect) {
                title = '取消保护工作簿'
            } else {
                title = '保护工作簿'
            }
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: true,
                title,
                type: 'protect'
            })

        },
        lock() {
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
                title: '锁定单元格',
                type: 'lock'
            })
        }
    }
}
</script>
<style type="text/css">
</style>