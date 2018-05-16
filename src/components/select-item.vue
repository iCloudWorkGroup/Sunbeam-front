<template>
	<div class="select-item" @dblclick="edit" :style="styleObject">
		<div class="box">
			<div class="bg"></div>
			<div class="expand"></div>
		</div>
	</div>
</template>
<script type="text/javascript">
    import * as types from '../store/action-types';
    import {SELECT} from '../tools/constant';

    export default {
        props: ['select', 'frozenRule'],
        computed: {
            styleObject() {
                let wholePosi = this.select.wholePosi,
                    physicsBox = this.select.physicsBox,
                    left = physicsBox.left,
                    top = physicsBox.top,
                    width = physicsBox.width,
                    height = physicsBox.height,
                    offsetLeft = this.frozenRule ? this.frozenRule.offsetLeft : 0,
                    offsetTop = this.frozenRule ? this.frozenRule.offsetTop : 0,
                    result;

                if (left === 0) {
                    left = left - 1;
                    width = width - 1;
                } else {
                    width = width - 2;
                }
                if (top === 0) {
                    top = top - 1;
                    height = height - 1;
                } else {
                    height = height - 2;
                }

                result = {
                    left: left - offsetLeft + 'px',
                    top: top - offsetTop + 'px',
                    width: width + 'px',
                    height: height + 'px'
                };

                return result;
            },
            wholePosi(){
                return this.select.wholePosi;
            }
        },
        methods: {
            edit() {
                this.$store.dispatch(types.EDIT_SHOW);
            }
        },
        mounted() {
            let self = this;
            this.$watch('select', function(newVal, oldVal) {
                if (newVal.type !== SELECT) {
                    return;
                }
                self.$store.dispatch(types.ROWS_UPDATEACTIVEROWS, {
                    oldStartAlias: oldVal.startRowAlias,
                    newStartAlias: newVal.startRowAlias,
                    oldEndAlias: oldVal.endRowAlias,
                    newEndAlias: newVal.endRowAlias
                });
                self.$store.dispatch(types.COLS_UPDATEACTIVECOLS, {
                    oldStartAlias: oldVal.startColAlias,
                    newStartAlias: newVal.startColAlias,
                    oldEndAlias: oldVal.endColAlias,
                    newEndAlias: newVal.endColAlias
                });
            });
        }
    };
</script>
<style type="text/css">
.select-item {
    position: absolute;
    border: 2px solid #217346;
    margin: -1px;
    overflow: hidden;
}

.select-item .box {
    position: relative;
    height: inherit;
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