<template>
<div class="select-group">
    <select-item
        v-for="item in selects"
        :key="item.alias"
        :select="item"
        :offsetLeft="offsetLeft"
        :offsetTop="offsetTop"/>
    <comment-item
            v-for="item in cells"
            :key="item.alias"
            :cell="item"
            :offsetTop="offsetTop"
            :offsetLeft="offsetLeft"
            @moveon="moveon"
            @moveout="moveout">
    </comment-item>
    <div class="comment" :style="style" v-if="commentShow">
        {{commentText}}
    </div>
</div>
</template>
<script>
import SelectItem from './select-item.vue'
import CommentItem from './comment-item.vue'
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
        selects() {
            return this.$store.getters.allSelects
        },
        cells() {
            let getters = this.$store.getters
            let startColIndex = getters.colIndexByAlias(this.colStart)
            let endColIndex = getters.colIndexByAlias(this.colOver)
            let startRowIndex = getters.rowIndexByAlias(this.rowStart)
            let endRowIndex = getters.rowIndexByAlias(this.rowOver)
            return this.$store.getters.cellsByVerticalHasComment({
                startColIndex,
                endColIndex,
                startRowIndex,
                endRowIndex
            })
        }
    },
    components: {
        SelectItem,
        CommentItem
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
            console.log(cell)
            this.style = {
                fontSize: '10pt',
                left: unit(cell.physicsBox.left + cell.physicsBox.width + 2 - this.offsetLeft),
                top: unit(cell.physicsBox.top - this.offsetTop),
                width: unit(config.commentWidth),
                height: unit(config.commentHeigth)
            }
        },
        moveout() {
            this.commentShow = false
        }
    }
}
</script>
<style type="text/css">
.select-group {
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
}
.comment {
    position: absolute;
    z-index: 999;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
}
</style>