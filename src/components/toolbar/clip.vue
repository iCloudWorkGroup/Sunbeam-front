<template>
<div class="fui-body">
        <span class="fui-layout">
            <div class="fui-section fui-alone" @click="paste">
                <div class="fui-cf-ico ico-paste"></div><div class="fui-cf-desc"><div class="fui-cf-text">粘贴</div></div>
            </div>
        </span>
        <span class="fui-layout">
            <div class="fui-section fui-transverse" @click="cut">
                <div class="fui-transverse-model"><span class="fui-cf-ico ico-section-ico ico-shear"></span><span class="fui-cf-text">剪切</span></div>
            </div>
            <div class="fui-section fui-transverse" @click="copy">
                <div class="fui-transverse-model"><span class="fui-cf-ico ico-section-ico ico-copy"></span><span class="fui-cf-text">复制</span></div>
            </div>
        </span>
</div>

</template>

<script type="text/javascript">
export default {
    methods: {
        paste() {
            console.log('run')
        },
        cut() {
            console.log('run')
        },
        copy() {
            console.log('run')
        }
    }
}
</script>