<template>
<div :class="classStr"
     @dblclick="edit"
     :style="styleObject">
    <div class="box">
        <div class="bg"></div>
        <div class="expand"></div>
    </div>
</div>

</template>

<script type="text/javascript">
import * as types from '../store/action-types'
import { SELECT, CLIP } from '../tools/constant'

export default {
    props: ['select', 'frozenRule'],
    computed: {
        styleObject() {
            let physicsBox = this.select.physicsBox
            let left = physicsBox.left
            let top = physicsBox.top
            let width = physicsBox.width
            let height = physicsBox.height
            let offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0
            let offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0
            let result

            if (left === 0) {
                left = left - 1
                width = width - 1
            } else {
                width = width - 2
            }
            if (top === 0) {
                top = top - 1
                height = height - 1
            } else {
                height = height - 2
            }

            result = {
                left: left - offsetLeft + 'px',
                top: top - offsetTop + 'px',
                width: width + 'px',
                height: height + 'px'
            }
            return result
        },
        classStr() {
            let type = this.select.type
            let result
            switch (type) {
                case SELECT:
                    result = 'select-item'
                    break
                case CLIP:
                    result = 'clip-item'
                    break
            }
            return result
        }
    },
    methods: {
        edit() {
            this.$store.dispatch(types.EDIT_SHOW)
        }
    },
    mounted() {
        let self = this
        this.$watch('select', function(newVal, oldVal) {
            if (newVal.type !== SELECT) {
                return
            }
            self.$store.dispatch(types.ROWS_UPDATEACTIVEROWS, {
                oldStartAlias: oldVal.startRowAlias,
                newStartAlias: newVal.startRowAlias,
                oldEndAlias: oldVal.endRowAlias,
                newEndAlias: newVal.endRowAlias
            })
            self.$store.dispatch(types.COLS_UPDATEACTIVECOLS, {
                oldStartAlias: oldVal.startColAlias,
                newStartAlias: newVal.startColAlias,
                oldEndAlias: oldVal.endColAlias,
                newEndAlias: newVal.endColAlias
            })
        })
    }
}
</script>
<style type="text/css">
.clip-item, .select-item {
    position: absolute;
    margin: -1px;
    overflow: hidden;
}
.select-item {
    border: 2px solid #217346;
    z-index: 1;
}
.clip-item {
    border: 2px dashed #217346;
    z-index: 0;
}
.select-item .box {
    position: relative;
    height: inherit;
}
.clip-item .box {
    background: #ddd;
    height: inherit;
    opacity: 0.35;
}
.select-item .box .expand {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 3px;
    height: 3px;
    z-index: 2;
    background: #217346;
    border: 1px solid #fff;
    cursor: crosshair;
}
.select-item .box .bg {
    background: #141414;
    opacity: .24;
    height: 100%;
}
.select-item {
    transition: .2s;
    -moz-transition: .2s;
    -webkit-transition: .2s;
    -o-transition: .2s;
}
</style>