<template>
<div class="sheet">
    <table class="cui-grid"
           cellspacing="0"
           cellpadding="0">
        <tbody>
            <tr>
                <td>
                    <div class="corner"
                         ref="corner"></div>
                </td>
                <td>
                    <col-head class="frozen-right-border"
                              :start="colFirst.start"
                              :over="colFirst.over"/>
                </td>
                <td>
                    <col-head :start="colLast.start"
                              :over="colLast.over"
                              :need-sider="true"/>
                </td>
            </tr>
            <tr>
                <td>
                    <row-head class="frozen-bottom-border"
                              :start="rowFirst.start"
                              :over="rowFirst.over"/>
                </td>
                <td>
                    <edit class="frozen-right-border frozen-bottom-border"
                          :row-start="rowFirst.start"
                          :row-over="rowFirst.over"
                          :col-start="colFirst.start"
                          :col-over="colFirst.over"/>
                </td>
                <td>
                    <edit class="frozen-bottom-border"
                          :row-start="rowFirst.start"
                          :row-over="rowFirst.over"
                          :col-start="colLast.start"
                          :col-over="colLast.over"
                          :need-sider="true"/>
                </td>
            </tr>
            <tr>
                <td>
                    <row-head :start="rowLast.start"
                              :over="rowLast.over"
                              :need-sider="true"/>
                </td>
                <td>
                    <edit class="frozen-right-border"
                          :row-start="rowLast.start"
                          :row-over="rowLast.over"
                          :col-start="colFirst.start"
                          :col-over="colFirst.over"
                          :need-sider="true"/>
                </td>
                <td>
                    <edit class="scroll-box"
                          :row-start="rowLast.start"
                          :row-over="rowLast.over"
                          :col-start="colLast.start"
                          :col-over="colLast.over"
                          @changeScrollTop="changeScrollTop"
                          @changeScrollLeft="changeScrollLeft"/>
                </td>
            </tr>
        </tbody>
    </table>
<!--     <input-box :scroll-left="scrollLeft"
               :scroll-top="scrollTop">
    </input-box> -->
</div>
</template>
<script type="text/javascript">
import config from '../config'
import scrollbar from '../util/scrollbar'
import ColHead from './col-head.vue'
import RowHead from './row-head.vue'
import Edit from './edit.vue'
import InputBox from './input-box.vue'

export default {
    data() {
        return {
            scrollbarWidth: scrollbar(),
            scrollTop: 0,
            scrollLeft: 0,
        }
    },
    computed: {
        rowFirst() {
            let rowRule = this.$store.state.sheets.list[0].frozen.row
            return rowRule.length > 0 ? rowRule[0] : {}
        },
        rowLast() {
            let rowRule = this.$store.state.sheets.list[0].frozen.row
            let len = rowRule.length
            return len > 0 ? rowRule[len - 1] : {}
        },
        colFirst() {
            let colRule = this.$store.state.sheets.list[0].frozen.col
            return colRule.length > 0 ? colRule[0] : {}
        },
        colLast() {
            let colRule = this.$store.state.sheets.list[0].frozen.col
            let len = colRule.length
            return len > 0 ? colRule[len - 1] : {}
        },
        colHeadWidth() {
            let frozenState = this.$store.getters.frozenState
            let offsetLeft = 0
            let userViewLeft = 0

            if (frozenState.colFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'topRule') {
                        offsetLeft = item.offsetLeft
                        userViewLeft = item.userViewLeft
                    }
                })
            }

            return this.sheetWidth - config.cornerWidth -
                this.scrollbarWidth - offsetLeft +
                userViewLeft
        },
        rowHeadHeight() {
            let frozenState = this.$store.getters.frozenState
            let offsetTop = 0
            let userViewTop = 0

            if (frozenState.rowFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'leftRule') {
                        offsetTop = item.offsetTop
                        userViewTop = item.userViewTop
                    }
                })
            }
            return this.sheetHeight - config.cornerHeight -
                this.scrollbarWidth - offsetTop +
                userViewTop
        },
        editWidth() {
            let frozenState = this.$store.getters.frozenState
            let offsetLeft = 0
            let userViewLeft = 0

            if (frozenState.colFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'mainRule') {
                        offsetLeft = item.offsetLeft
                        userViewLeft = item.userViewLeft
                    }
                })
            }
            return this.sheetWidth - config.cornerWidth - offsetLeft +
                userViewLeft
        },
        editHeight() {
            let frozenState = this.$store.getters.frozenState
            let offsetTop = 0
            let userViewTop = 0

            if (frozenState.rowFrozen) {
                frozenState.rules.forEach(function(item) {
                    if (item.type === 'mainRule') {
                        offsetTop = item.offsetTop
                        userViewTop = item.userViewTop
                    }
                })
            }
            return this.sheetHeight - config.cornerHeight - offsetTop +
                userViewTop
        }
    },
    components: {
        ColHead,
        RowHead,
        Edit,
        InputBox
    },
    methods: {
        changeScrollTop(val) {
            this.scrollTop = val

        },
        changeScrollLeft(val) {
            this.scrollLeft = val
        }
    },
}
</script>
<style type="text/css">
.sheet {
    position: absolute;
    top: 0;
    left: 0;
}

.corner {
    border-width: 0 1px 1px 0;
    border-color: #bfbfbf;
    border-style: solid;
    height: 19px;
    width: 36px;
    z-index: 100;
    background: white;
}
</style>