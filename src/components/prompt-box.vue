<template>
    <div class="prompt">
        <span>{{texts}}</span>
        <div class="close-prompt"
        @click="closePrompt">X</div>
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
    .prompt{
        padding: 20px;
        text-align: center;
        background: #888888;
        width: 400px;
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
        top: 50px;
        border-radius: 5px;
    }
    .close-prompt{
        text-align: center;
        width: 20px;
        height: 20px;
        background: red;
        border-radius: 50%;
        position: absolute;
        right: 5px;
        top: 5px;
        cursor: pointer;
    }
</style>