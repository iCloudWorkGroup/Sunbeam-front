<template>
<textarea class="edit-frame"
        :value="texts"
        :style="styleObject"
        @keydown="keydownHandle"
        @blur="completeEdit"
        @copy="copyData"
        @cut="cutData"
        @paste="pasteData">
</textarea>
</template>
<script type="text/javascript">
import {
    EDIT_HIDE,
    SELECTS_INSERT,
    CELLS_PASTE
} from '../store/action-types'
import {
    UPDATE_FOCUSSTATE,
    DELETE_SELECT
} from '../store/mutation-types'
import {
    CLIP
} from '../tools/constant'
import cache from '../tools/cache'
import config from '../config'

export default {
    props: [
        'scrollLeft',
        'scrollTop'
    ],
    mounted() {
        // this.getFocus()
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
                fontSize: state.size + 'pt',
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
        },
        copyData(e) {
            let select = this.$store.getters.activeSelect
            let selects = this.$store.getters.selectList
            let wholePosi = select.wholePosi
            if (wholePosi.endColAlias === 'MAX' || wholePosi.endRowAlias ===
                'MAX') {
                return
            }
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === CLIP) {
                    let currentSheet = this.$store.state.currentSheet
                    this.$store.commit(DELETE_SELECT, {
                        currentSheet,
                        select: selects[i]
                    })
                }
            }
            cache.clipState = 'copy'
            this.$store.dispatch(SELECTS_INSERT, CLIP)
            let getters = this.$store.getters
            let text = getters.getClipData()
            let clipboardData
            e.preventDefault()
            if (window.clipboardData && window.clipboardData.getData) {
                clipboardData = window.clipboardData
            } else {
                clipboardData = e.clipboardData
            }
            cache.clipData = text
            clipboardData.setData('Text', text)
        },
        cutData(e) {
            let select = this.$store.getters.activeSelect
            let selects = this.$store.getters.selectList
            let wholePosi = select.wholePosi
            if (wholePosi.endColAlias === 'MAX' || wholePosi.endRowAlias ===
                'MAX') {
                return
            }
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === CLIP) {
                    let currentSheet = this.$store.state.currentSheet
                    this.$store.commit(DELETE_SELECT, {
                        currentSheet,
                        select: selects[i]
                    })
                }
            }
            cache.clipState = 'cut'
            this.$store.dispatch(SELECTS_INSERT, CLIP)
            let getters = this.$store.getters
            let text = getters.getClipData()
            let clipboardData
            e.preventDefault()
            if (window.clipboardData && window.clipboardData.getData) {
                clipboardData = window.clipboardData
            } else {
                clipboardData = e.clipboardData
            }
            cache.clipData = text
            clipboardData.setData('Text', text)
        },
        pasteData(e) {
            if (this.$store.getters.getEidtState) {
                return
            }
            e.preventDefault()
            let text
            if (window.clipboardData && window.clipboardData.getData) {
                text = window.clipboardData.getData('Text')
            } else {
                text = e.clipboardData.getData('Text')
            }
            if (cache.clipState !== '' && text === cache.clipData) {
                this.$store.dispatch(CELLS_PASTE)
            } else {
                this.$store.dispatch(CELLS_PASTE, text)
            }
        },
        keydownHandle(e) {
            let key = e.key
            let altKey = e.altKey
            if (key === 'Enter' && !altKey) {
                this.completeEdit()
            } else if (key === 'Enter' && altKey) {
                this.insertAtCursor('\n', e.target)
            }
        },
        insertAtCursor(insertChar, elem) {
            let cursor
            if (document.selection) {
                elem.focus()
                cursor = document.selection.createRange()
                cursor.text = insertChar
                elem.focus()
            } else if (typeof elem.selectionStart === 'number' &&
                typeof elem.selectionEnd === 'number') {
                let startPos = elem.selectionStart
                let endPos = elem.selectionEnd
                let scrollTop = elem.scrollTop
                elem.value = elem.value.substring(0, startPos) +
                    insertChar + elem.value.substring(endPos, elem.value.length)
                elem.focus()
                elem.selectionStart = startPos + insertChar.length
                elem.selectionEnd = startPos + insertChar.length
                elem.scrollTop = scrollTop
            } else {
                elem.value += insertChar
                elem.focus()
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
