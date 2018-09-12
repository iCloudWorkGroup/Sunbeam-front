<template>
<div class="cell-group">
    <cell-item
        v-for="item in cells"
        :key="item.alias"
        :cell="item"
        :offsetTop="offsetTop"
        :offsetLeft="offsetLeft"
        @moveon="moveon"
        @moveout="moveout">
    </cell-item>
    <div class="comment" :style="style" v-if="commentShow">
        {{commentText}}
    </div>
</div>
</template>
<script>
import CellItem from './cell-item.vue'
import {
    unit
} from '../filters/unit'
import config from '../config'
export default {
    props: [
        'rowStart',
        'rowOver',
        'colStart',
        'colOver',
        'offsetLeft',
        'offsetTop'
    ],
    computed: {
        cells() {
            let getters = this.$store.getters
            let startColIndex = getters.colIndexByAlias(this.colStart)
            let endColIndex = getters.colIndexByAlias(this.colOver)
            let startRowIndex = getters.rowIndexByAlias(this.rowStart)
            let endRowIndex = getters.rowIndexByAlias(this.rowOver)
            return this.$store.getters.cellsByVerticalShouldShow({
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        }
    },
    components: {
        CellItem
    },
    data() {
        return {
            style: '',
            commentShow: false,
            commentText: ''
        }
    },
    methods: {
        moveon(cell) {
            this.commentShow = true
            this.commentText = cell.customProp.comment
            this.style = {
                fontSize: '10pt',
                left: unit(cell.physicsBox.left + cell.physicsBox.width + 2),
                top: unit(cell.physicsBox.top),
                width: unit(config.commentWidth),
                height: unit(config.commentHeigth)
            }
        },
        moveout(style) {
            this.commentShow = false
        }
    }
}
</script>