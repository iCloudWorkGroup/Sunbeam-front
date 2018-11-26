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
    <div class="comment"
         :style="objStyle"
         v-if="commentShow"
         v-html="comment">
    </div>
    <div class="sequence"
         v-if="sortShow"
         :style="sortStyle">
        <div class="sequence-btn sequence-btn-right"
            @click="changeBtn">
            <div class="sequence-btn-arrow"></div>
        </div>
        <ul class="sequence-list"
            style="height: 60px"
            :class="{ active: active}">
            <li class="sequence-list-item"
                v-for="(value, index) in sortValue"
                date-value="sss"
                @click="setCellText(index)">
                <span date-value="value">{{value}}</span>
            </li>
        </ul>
    </div>
</div>
</template>
<script type="text/javascript">
import scrollbar from '../util/scrollbar'
import ColHead from './col-head.vue'
import RowHead from './row-head.vue'
import Edit from './edit.vue'
import Box from './box.vue'
import {
    unit
} from '../filters/unit'
import config from '../config'
import {
    formatText, isNum, isDate,
    parseExpress, parsePropStruct,
    parseType,
} from '../tools/format'
import send from '../util/send'
export default {
    data() {
        return {
            scrollbarWidth: scrollbar(),
            localState: this.$store.state,
            active: false,
            sortValue: ''
        }
    },
    computed: {
        localSheet() {
            return this.localState.sheets.list[0]
        },
        frozenMode: function () {
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
        objStyle() {
            let cell = this.$store.getters.mouseInCell
            let userView = this.$store.getters.userView()
            return {
                fontSize: '10pt',
                width: unit(150),
                height: unit(150),
                left: unit(cell.physicsBox.left + cell.physicsBox.width - this.localState.sheets.scroll.left + config.cornerWidth + 2 - userView.left),
                top: unit(cell.physicsBox.top - this.localState.sheets.scroll.top + config.cornerHeight - 2 - userView.top),
            }
        },
        sortStyle() {
            let cell = this.$store.getters.activeCell()
            let userView = this.$store.getters.userView()
            // let height = this.active ? cell.physicsBox.height : 0
            return {
                fontSize: '10pt',
                width: unit(cell.physicsBox.width + 2),
                left: unit(cell.physicsBox.left - this.localState.sheets.scroll.left + config.cornerWidth - 1 - userView.left),
                top: unit(cell.physicsBox.top + cell.physicsBox.height - this.localState.sheets.scroll.top + config.cornerHeight - 1 - userView.top),
            }
        },
        comment() {
            let comment = this.$store.getters.mouseInCell.customProp.comment
            let reg = new RegExp('\n', 'g')
            let spaceReg = new RegExp(' ', 'g')
            return comment.toString().replace(reg, '<br>').replace(spaceReg, '&ensp;')
        },
        commentShow() {
            return this.$store.getters.mouseInCell != null
        },
        sortShow() {
            let cell = this.$store.getters.activeCell()
            this.active = false
            let flag = false
            if (cell != null) {
                let ruleID = cell.ruleIndex
                if (ruleID != null) {
                    let validate = this.$store.getters.validateByIndex(ruleID)
                    if (validate.type === 3 || validate.type === 7) {
                        flag = true
                    }
                }
            }
            return flag
        },
        rowFirst() {
            let rowRule = this.localSheet.frozen.row
            return rowRule.length > 0 ? rowRule[0] : {}
        },
        rowLast() {
            if (this.frozenMode === 'NO' || this.frozenMode === 'COL') {
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
            if (this.frozenMode === 'NO' || this.frozenMode === 'ROW') {
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
        Box,
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

        },
        changeBtn() {
            if (this.active) {
                this.active = false
                return
            }
            let cell = this.$store.getters.activeCell()
            let validate = this.$store.getters.validateByIndex(cell.ruleIndex)
            let select = this.$store.getters.selectByType('SELECT')
            let rowIndex = this.$store.getters.rowIndexByAlias(select.wholePosi.startRowAlias)
            let colIndex = this.$store.getters.colIndexByAlias(select.wholePosi.startColAlias)
            if (validate.type === 3) {
                this.sortValue = validate.formula1.split(',')
                this.active = !this.active
            } else {
                let _this = this
                send({
                    url: config.url.full,
                    body: JSON.stringify({
                        oprCol: colIndex,
                        oprRow: rowIndex
                    })
                }, false).then(function(data) {
                    _this.sortValue = data.expResult
                    _this.active = !_this.active
                })
            }
        },
        setCellText(index) {
            this.active = false
            let cell = this.$store.getters.activeCell()
            let select = this.$store.getters.selectByType('SELECT')
            let rowIndex = this.$store.getters.rowIndexByAlias(select.wholePosi.startRowAlias)
            let colIndex = this.$store.getters.colIndexByAlias(select.wholePosi.startColAlias)
            let value = this.sortValue[index]
            let propStruct = { content: {}}
            let rules
            let date = false
            let row = this.$store.getters.allRows[rowIndex].props.content
            let col = this.$store.getters.allCols[colIndex].props.content
            let formatObj = parseType(value)
            if (formatObj.autoRecType === 'text') {
                propStruct.content.texts = value
                propStruct.content.displayTexts = value
                // 修正单元格对齐方式
                propStruct.content.alignRowFormat = 'left'
            } else {
                let fixProp = parsePropStruct(cell, formatObj, value, row, col)
                let express = fixProp.content.express
                let fixText = fixProp.content.texts
                propStruct.content = fixProp.content
                rules = parseExpress(express)
                date = fixProp.date
                if (express !== '@') {
                    rules = parseExpress(express)
                    date = formatObj.date
                    propStruct.content.displayTexts = this.parseText(date, rules, fixText)
                } else {
                    propStruct.content.displayTexts = fixText
                }
            }
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'texts',
                propStruct,
            })
        },
        parseText(date, rules, texts) {
            let text = texts
            if (date && isDate(text)) {
                text = formatText(rules, text)
            } else if (!date && isNum(text)) {
                text = formatText(rules, parseFloat(text, 10))
            }
            return text
        },
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
.comment {
    position: absolute;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
}
.sort-value {
    position: absolute;
}
</style>