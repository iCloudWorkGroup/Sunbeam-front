<template>
<textarea class="comment"
          v-show="activeComment"
          v-focus="editCom"
          :value="texts"
          :style="styleObject"
          @blur="editComment">
</textarea>
</template>
<script type="text/javascript">
import config from '../config'
import {
    unit
} from '../filters/unit'
export default {
    props: [
        'scrollTop',
        'scrollLeft'
    ],
    data() {
        return {
            startColAlias: '',
            endColAlias: '',
            startRowAlias: '',
            endRowAlias: '',
            lastText: ''
        }
    },
    computed: {
        styleObject() {
            let select = this.$store.getters.selectByType('SELECT')
            let physical = select.physicsBox
            /**
             * 1. 因为单元格相对于内容区域定位，
             * 而编辑框是相对于所以编辑区，所以需要考虑corner的大小
             * 2. 这里的 -1 是为了覆盖单元格的边框
             * 3. 下面的 -8 ,pading距离是3px, 再加上上面的 1px
             * 8 = 3*2 + 1*2
             */
            let top = physical.top - this.scrollTop + config.cornerHeight - 1
            let left = physical.left - this.scrollLeft + config.cornerWidth + 4 + physical.width
            let width = config.commentWidth
            let height = config.commentHeigth
            return {
                top: unit(top),
                left: unit(left),
                width: unit(width),
                height: unit(height)
            }
        },
        editCom() {
            let state = this.$store.getters.activeComment
            if (state === true || state === false) {
                return true
            }
        },
        activeComment() {
            return this.$store.getters.activeComment
        },
        texts() {
            let cell = this.$store.getters.activeCell()
            let select = this.$store.getters.selectByType('SELECT')
            // 为避免修改错误的单元格批注，需要将要修改单元格的位置信息传入
            this.startRowAlias = select.wholePosi.startRowAlias
            this.startColAlias = select.wholePosi.startColAlias
            this.endRowAlias = select.wholePosi.endRowAlias
            this.endColAlias = select.wholePosi.endColAlias
            // 记录原comment值
            if (!cell) {
                this.lastText = null
                return null
            }
            this.lastText = cell.customProp.comment == null ? '' : cell.customProp.comment
            return cell.customProp.comment == null ? '' : cell.customProp.comment
        },
    },
    methods: {
        editComment(e) {
            let texts = e.target.value.trim()
            this.$store.commit('M_UPDATE_COMMENT_SATTUS', false)
            if (texts !== this.lastText) {
                this.$store.dispatch('A_CELLS_UPDATE', {
                    propName: 'comment',
                    propStruct: {
                        customProp: {
                            comment: texts
                        }
                    },
                    coordinate: {
                        startRowAlias: this.startRowAlias,
                        startColAlias: this.startColAlias,
                        endRowAlias: this.endRowAlias,
                        endColAlias: this.endColAlias
                    }
                })
            }
        }
    }
}
</script>
