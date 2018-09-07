<template>
<textarea class="edit-frame"
        :value="texts"
        :style="styleObject"
        @keydown="keydownHandle"
        @blur="doneEdit"
        @copy="copyData"
        @cut="cutData"
        @paste="pasteData"
        v-focus="isEditing">
</textarea>
</template>
<script type="text/javascript">
import {
    SELECTS_INSERT,
} from '../store/action-types'
import {
    DELETE_SELECT
} from '../store/mutation-types'
import {
    CLIP
} from '../tools/constant'
import cache from '../tools/cache'
import config from '../config'
import {
    unit
} from '../filters/unit'
export default {
    props: [
        'scrollTop',
        'scrollLeft'
    ],
    computed: {
        styleObject() {
            let props = this.$store.getters.inputProps
            let physical = props.physical

            /**
             * 1. 因为单元格相对于内容区域定位，
             * 而编辑框是相对于所以编辑区，所以需要考虑corner的大小
             * 2. 这里的 -1 是为了覆盖单元格的边框
             * 3. 下面的 -8 ,pading距离是3px, 再加上上面的 1px
             * 8 = 3*2 + 1*2
             */
            let top = physical.top - this.scrollTop + config.cornerHeight - 1
            let left = physical.left - this.scrollLeft + config.cornerWidth - 1
            let width = physical.width - 8 < 0 ? 0 : physical.width - 8
            let height = physical.height - 8 < 0 ? 0 : physical.height - 8
            return {
                top: unit(top),
                left: unit(left),
                width: unit(width),
                height: unit(height),
                fontFamily: physical.family,
                fontSize: physical.size + 'pt',
                fontStyle: physical.italic,
                color: physical.color,
                textDecoration: physical.underline,
            }
        },
        texts() {
            let props = this.$store.getters.inputProps
            return props.physical.texts
        },
        isEditing() {
            let props = this.$store.getters.inputProps
            let status = props.assist.status
            // 这是一个特殊情况，不论值等于多少都要返回true
            // 同时，这个值还需要随时变化
            if (status === true || status === false) {
                return true
            }
        }
    },
    methods: {
        doneEdit(e) {
            const texts = e.target.value.trim()
            this.$store.dispatch('A_INPUT_EDITDONE', texts)
        },
        copyData(e) {
            let selects = this.$store.getters.allSelects
            let select = this.$store.getters.selectByType(this.$store.getters.activeType)
            let wholePosi = select.wholePosi
            if (wholePosi.endColAlias === 'MAX' || wholePosi.endRowAlias ===
                'MAX') {
                return
            }
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === CLIP) {
                    this.$store.commit(DELETE_SELECT, {
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
            let clipboardData = window.clipboardData != null ?
                window.clipboardData :
                e.clipboardData
            let texts = clipboardData.getData('Text')
            let assist = this.$store.getters.inputProps.assist
            if (assist.rowAlias == null || assist.colAlias == null) {
                e.preventDefault()
                if (texts === cache.clipData) {
                    this.$store.dispatch('A_CELLS_INNERPASTE')
                } else {
                    this.$store.dispatch('A_CELLS_OUTERPASTE', texts)
                }
            }
        },
        keydownHandle(e) {
            let key = e.key
            let altKey = e.altKey
            if (key === 'Enter' && !altKey) {
                this.doneEdit(e)
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
    }
}
</script>
