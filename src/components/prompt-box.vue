<template>
    <div class="sheets-shadow" @click="closePrompt">
        <div class="prompt-box">
            <div class="prompt-img">
                <img src="../img/error.png" alt="">
            </div>
            <div class="prompt-text">
                {{texts}}
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
export default {
    computed: {
        texts() {
            return this.$store.state.sheets.prompt.texts
        }
    },
    methods: {
        closePrompt() {
            this.$store.commit('M_UPDATE_PROMPT', {
                texts: '',
                show: false
            })
        }
    }
}
</script>
<style type="text/css">
</style>