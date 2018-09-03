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
                              v-if="frozenMode === 'COL' || frozenMode === 'CUSTOM'"
                              :start="colFirst.start"
                              :over="colFirst.over"/>
                </td>
                <td>
                    <col-head :start="colLast.start"
                              :over="colLast.over"
                              :need-sider="true"
                              :scroll-left="scrollLeft"/>
                </td>
            </tr>
            <tr>
                <td>
                    <row-head class="frozen-bottom-border"
                              v-if="frozenMode === 'ROW' || frozenMode === 'CUSTOM'"
                              :start="rowFirst.start"
                              :over="rowFirst.over"/>
                </td>
                <td>
                    <edit class="frozen-right-border frozen-bottom-border"
                          v-if="frozenMode === 'CUSTOM'"
                          :row-start="rowFirst.start"
                          :row-over="rowFirst.over"
                          :col-start="colFirst.start"
                          :col-over="colFirst.over"/>
                </td>
                <td>
                    <edit class="frozen-bottom-border"
                          v-if="frozenMode === 'ROW' || frozenMode === 'CUSTOM'"
                          :row-start="rowFirst.start"
                          :row-over="rowFirst.over"
                          :col-start="colLast.start"
                          :col-over="colLast.over"
                          :need-sider="true"
                          :scroll-left="scrollLeft"/>
                </td>
            </tr>
            <tr>
                <td>
                    <row-head :start="rowLast.start"
                              :over="rowLast.over"
                              :need-sider="true"
                              :scroll-top="scrollTop"/>
                </td>
                <td>
                    <edit class="frozen-right-border"
                          v-if="frozenMode === 'COL' || frozenMode === 'CUSTOM'"
                          :row-start="rowLast.start"
                          :row-over="rowLast.over"
                          :col-start="colFirst.start"
                          :col-over="colFirst.over"
                          :need-sider="true"
                          :scroll-top="scrollTop"/>
                </td>
                <td>
                    <edit class="scroll-box"
                          :row-start="rowLast.start"
                          :row-over="rowLast.over"
                          :col-start="colLast.start"
                          :col-over="colLast.over"
                          :scroll-top="scrollTop"
                          :scroll-left="scrollLeft"
                          @scrollPanel="scrollPanel"/>
                </td>
            </tr>
        </tbody>
    </table>
    <box :scroll-top="scrollTop"
         :scroll-left="scrollLeft"/>
</div>
</template>
<script type="text/javascript">
import scrollbar from '../util/scrollbar'
import ColHead from './col-head.vue'
import RowHead from './row-head.vue'
import Edit from './edit.vue'
import Box from './box.vue'
export default {
    data() {
        return {
            scrollbarWidth: scrollbar(),
            localState: this.$store.state
        }
    },
    computed: {
        localSheet() {
            return this.localState.sheets.list[0]
        },
        frozenMode() {
            let colLen = this.localSheet.frozen.col.length
            let rowLen = this.localSheet.frozen.row.length
            if (colLen !== 0 && rowLen !== 0) {
                return 'CUSTOM'
            }
            if (colLen !== 0) {
                return 'COL'
            }
            if (rowLen !== 0) {
                return 'ROW'
            }
            return 'NO'
        },
        scrollLeft() {
            return this.localState.sheets.scroll.left
        },
        scrollTop() {
            return this.localState.sheets.scroll.top
        },
        rowFirst() {
            let rowRule = this.localSheet.frozen.row
            return rowRule.length > 0 ? rowRule[0] : {}
        },
        rowLast() {
            if (this.frozenMode === 'NO') {
                let rows = this.$store.getters.allRows
                return {
                    start: rows[0].alias,
                    over: rows[rows.length - 1].alias
                }
            } else {
                let rowRule = this.localSheet.frozen.row
                let len = rowRule.length
                return len > 0 ? rowRule[len - 1] : {}
            }
        },
        colFirst() {
            let colRule = this.localSheet.frozen.col
            return colRule.length > 0 ? colRule[0] : {}
        },
        colLast() {
            if (this.frozenMode === 'NO') {
                let cols = this.$store.getters.allCols
                return {
                    start: cols[0].alias,
                    over: cols[cols.length - 1].alias
                }
            } else {
                let colRule = this.localSheet.frozen.col
                let len = colRule.length
                return len > 0 ? colRule[len - 1] : {}
            }
        }
    },
    components: {
        ColHead,
        RowHead,
        Edit,
        Box
    },
    methods: {
        /**
         * 为了让各个视图同步滚动，用方法改变state，保持同步
         */
        scrollPanel({
            scrollTop,
            scrollLeft
        }) {
            this.$store.commit('UPDATE_SHEETS_SCROLL', {
                scrollTop,
                scrollLeft
            })

        }
    }
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