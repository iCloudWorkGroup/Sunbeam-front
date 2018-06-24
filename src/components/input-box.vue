<template>
<textarea class="edit-frame"
          :value="texts"
          @blur="completeEdit"
          :style="styleObject">
</textarea>
</template>
<script type="text/javascript">
import {EDIT_HIDE} from '../store/action-types'
import {UPDATE_FOCUSSTATE} from '../store/mutation-types'
import config from '../config'

export default {
    props: [
        'scrollLeft',
        'scrollTop'
    ],
    mounted() {
        this.getFocus()
    },
    computed: {
        left() {
            let getters = this.$store.getters
            let getInputState = getters.getInputState
            let left = getters.getInputState.left

            if (getInputState.transverseScroll) {
                left += this.scrollLeft
            }
            left += config.cornerWidth
            return left
        },
        top() {
            let inputState = this.$store.getters.getInputState
            let top = inputState.top
            if (inputState.verticalScroll) {
                top += this.scrollTop
            }
            top += config.cornerHeight
            return top
        },
        styleObject() {
            let state = this.$store.getters.getInputState
            return {
                top: this.top + 1 + 'px',
                left: this.left + 1 + 'px',
                width: state.width + 'px',
                height: state.height + 'px',
                fontFamily: state.family,
                fontSize: state.size + 'px',
                fontStyle: state.italic,
                color: state.color,
                textDecoration: state.underline,
            }
        },
        texts() {
            let state = this.$store.getters.getInputState
            return state.texts
        },
        editState() {
            return this.$store.getters.getEidtState
        },
        focusState() {
            return this.$store.state.focusState
        }
    },
    methods: {
        completeEdit() {
            if (this.editState) {
                this.$store.dispatch(EDIT_HIDE, this.$el.value)
            }
        },
        getFocus() {
            if (!this.$store.state.focusState) {
                this.$el.focus()
                this.$store.commit(UPDATE_FOCUSSTATE, true)
            }
        }
    },
    watch: {
        focusState(val) {
            if (!val) {
                this.getFocus()
            }
        }
    }
}
</script>
