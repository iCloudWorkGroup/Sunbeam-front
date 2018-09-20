<template>
    <div class="widget">
        <div class="widget-panel"
             style="max-height:200px;">
            <ul class="widget-menu frozenBox" style="min-width:220px">
                <li @mousedown.stop="hideRow" v-show="opr === 'hide'">
                    <span class=" widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">隐藏行</div>
                    </span>
                </li>
                <li @mousedown.stop="hideCol" v-show="opr === 'hide'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">隐藏列</div>
                        </span>
                </li>
                <li @mousedown.stop="showRow" v-show="opr === 'show'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">显示行</div>
                        </span>
                </li>
                <li @mousedown.stop="showCol" v-show="opr === 'show'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">显示列</div>
                        </span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import {
    COLS_HIDE,
    ROWS_HIDE,
    COLS_CANCELHIDE,
    ROWS_CANCELHIDE
} from '../../store/action-types'
// import {
//     pathToStruct
// } from '../../tools/format'
export default {
    data() {
        return {
        }
    },
    props: ['opr'],
    methods: {
        hideCol() {
            this.$store.dispatch(COLS_HIDE)
        },
        hideRow() {
            this.$store.dispatch(ROWS_HIDE)
        },
        showCol() {
            this.$store.dispatch(COLS_CANCELHIDE)
        },
        showRow() {
            this.$store.dispatch(ROWS_CANCELHIDE)
        }
    }
}
</script>