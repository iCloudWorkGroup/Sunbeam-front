<template>
    <div class="widget">
        <div class="widget-panel"
             style="max-height:200px;">
            <ul class="widget-menu frozenBox" style="min-width:220px">
                <li @click="hideRow" id="hideRow" v-show="opr === 'hide'">
                    <span class=" widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">隐藏行</div>
                    </span>
                </li>
                <li @click="hideCol" id="hideCol" v-show="opr === 'hide'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">隐藏列</div>
                        </span>
                </li>
                <li @click="showRow" id="showRow" v-show="opr === 'show'">
                    <span class="widget-ico"></span>
                    <span class="widget-content">
                            <div class="widget-weight">显示行</div>
                        </span>
                </li>
                <li @click="showCol" id="showCol" v-show="opr === 'show'">
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
    computed: {
        showColFlag() {
            return this.$store.state.oprclick.showColFlag
        },
        hideColFlag() {
            return this.$store.state.oprclick.hideColFlag
        },
        showRowFlag() {
            return this.$store.state.oprclick.showRowFlag
        },
        hideRowFlag() {
            return this.$store.state.oprclick.hideRowFlag
        },
    },
    methods: {
        hideCol() {
            if (!this.hideColFlag) {
                return
            }
            this.$store.dispatch(COLS_HIDE)
        },
        hideRow() {
            if (!this.hideRowFlag) {
                return
            }
            this.$store.dispatch(ROWS_HIDE)
        },
        showCol() {
            if (!this.showColFlag) {
                return
            }
            this.$store.dispatch(COLS_CANCELHIDE)
        },
        showRow() {
            if (!this.showRowFlag) {
                return
            }
            this.$store.dispatch(ROWS_CANCELHIDE)
        }
    }
}
</script>