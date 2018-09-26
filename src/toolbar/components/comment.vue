<template>
    <div class="fui-body">
        <span class="fui-layout">
            <div class="fui-section fui-transverse" @click="addComment">
                <div class="fui-cf-comment-ico ico-commentadd fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">添加批注</div>
                </div>
            </div>
        </span>
        <span class="fui-layout">
            <div class="fui-section fui-transverse" @click="editComment">
                <div class="fui-cf-comment-ico ico-commentedit fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">编辑批注</div>
                </div>
            </div>
        </span>
        <span class="fui-layout">
            <div class="fui-section fui-transverse" @click="deleteComment">
                <div class="fui-cf-comment-ico ico-commentremove fui-cf-alone"></div>
                <div class="fui-cf-desc">
                    <div class="fui-cf-text">删除批注</div>
                </div>
            </div>
        </span>
    </div>
</template>
<script type="text/javascript">
export default {
    computed: {
    },
    methods: {
        addComment() {
            this.$store.dispatch('EDIT_SHOW', {
                type: 'COMMENT'
            })
        },
        deleteComment() {
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'recomment',
                propStruct: {
                    customProp: {
                        comment: null
                    }
                },
            })
        },
        editComment() {
            this.$store.dispatch('EDIT_SHOW', {
                type: 'COMMETN'
            })
        }
    }
}
</script>
<style type="text/css">
</style>