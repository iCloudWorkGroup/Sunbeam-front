<template>
    <div class="sheets-shadow" @click="closePrompt">
        <div class="prompt-box"
             :class="{ promptError: type==='error', promptSuccess: type ==='success' }">
            <div class="prompt-left">
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
        },
        type() {
            return this.$store.state.sheets.prompt.type
        }
    },
    methods: {
        closePrompt() {
            this.$store.commit('M_UPDATE_PROMPT', {
                texts: '',
                show: false,
                type: ''
            })
        }
    }
}
</script>
<style type="text/css">
</style>