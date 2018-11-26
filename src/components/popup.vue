<template>
    <div class="book-popup"
         v-show="popup.show"
        :style="{ height }">
        <div class="siderbar" style="width: 280px;">
            <div class="siderbar-title">
                <span>{{popup.title}}</span>
                <span
                   class="fui-cf-bg-extend2-ico ico-close close"
                   title="关闭"
                   @click="close"></span>
            </div>
            <div class="siderbar-body" v-show="popup.type === 'validation'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="validate-title">验证条件:</div>
                        <form class="validate-content">
                            <div>
                                <label>类型:</label>
                                <select v-model="validationed" @change="typeChange">
                                    <option v-for="validation in validations" :value="validation.value">{{ validation.text }}</option>
                                </select>
                            </div>
                            <div v-show="validationed !== 0 && validationed !== 3">
                                <label>范围:</label>
                                <select v-model="ranged" @change="rangeChange">
                                    <option v-for="range in ranges" :value="range.value">{{ range.text }}</option>
                                </select>
                            </div>
                            <div class="range" v-show="validationed !== 3 && validationed !== 0">
                                <div v-show="ranged !== 2 && ranged !== 3 && ranged !== 5 && ranged !== 7">
                                    <label>最小值:</label>
                                    <input type="number" name="min" class="min" v-model="min">
                                </div>
                                <div v-show="ranged !== 2 && ranged !== 3 && ranged !== 4 && ranged !== 6">
                                    <label>最大值:</label>
                                    <input type="number" name="max" class="max" v-model="max">
                                </div>
                                <div v-show="ranged === 2 || ranged === 3">
                                    <label>数值:</label>
                                    <input type="number" name="number" class="number" v-model="number">
                                </div>
                            </div>
                            <div class="source" v-show="validationed === 3">
                                <label>来源:</label>
                                <input type="text" class="source-data"
                                        maxlength="50" name="source"
                                        v-model="sort">
                                <input type="hidden" class="source-data"
                                       maxlength="50" name="source1"
                                       v-model="dateCellIndex">
                                <div class="select-out"
                                     :class="{ on: dateSource}"
                                     @click="changeSelect"></div>
                            </div>
                        </form>
                        <div class="error">选中区域内包含多种验证规则</div>
                        <div class="oper">
                            <span class="confirm" @click="adjuctValidation">确定</span>
                            <span class="cancel" @click="close">取消</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="siderbar-body" v-show="popup.type === 'width'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="validate-title">调整列宽:</div>
                        <form class="validate-content">
                            <div class="range">
                                <label>列标:</label>
                                <input type="text" :value="colIndex" disabled><br>
                                <label>宽度:</label>
                                <input type="number" name="width" v-model="value" class="width"><br>
                            </div>
                        </form>
                        <div class="oper">
                            <span class="confirm" @click="adjustColWidht">确定</span>
                            <span class="cancel" @click="close">取消</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="siderbar-body" v-show="popup.type === 'height'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="validate-title">调整行高:</div>
                        <form class="validate-content">
                            <div class="range">
                                <label>行标:</label>
                                <input type="text" :value="rowIndex" disabled><br>
                                <label>高度:</label>
                                <input type="number" name="height" v-model="value" class="height"><br>
                            </div>
                        </form>
                        <div class="oper">
                            <span class="confirm" @click="adjustRowHeight">确定</span>
                            <span class="cancel" @click="close">取消</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="siderbar-body" v-show="popup.type === 'color'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="validate-title">修改背景色:</div>
                        <form class="validate-content">
                            <div class="range">
                                <label>坐标:</label>
                                <input type="text" :value="cellIndex" disabled><br>
                                <label>颜色:</label>
                                <input type="color" name="color" v-model="value" class="color"><br>
                            </div>
                        </form>
                        <div class="oper">
                            <span class="confirm" @click="adjustColor">确定</span>
                            <span class="cancel" @click="close">取消</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/javascript">
import {
    unit
} from '../filters/unit'
import {
    hexToRgb, validateSendPara,
    validateReason
} from '../tools/format'
import {
    getColDisplayName
} from '../util/displayname'
import scrollbar from '../util/scrollbar'
import config from '../config'
export default {
    data() {
        return {
            select: '',
            colArr: [],
            rowArr: [],
            colLength: '',
            rowLength: '',
            value: '',
            validationed: 'default',
            max: '',
            min: '',
            number: '',
            sort: '',
            validations: [
                { value: 0, text: '任意值' },
                { value: 1, text: '整数' },
                { value: 2, text: '小数' },
                { value: 6, text: '文本长度' },
                { value: 3, text: '序列' },
            ],
            ranged: 0,
            ranges: [
                { value: 0, text: '介于' },
                { value: 1, text: '不介于' },
                { value: 2, text: '等于' },
                { value: 3, text: '不等于' },
                { value: 4, text: '大于' },
                { value: 5, text: '小于' },
                { value: 6, text: '大于等于' },
                { value: 7, text: '小于等于' },
            ],
            dateSource: false,
        }
    },
    computed: {
        height() {
            return unit(this.$store.getters.offsetHeight - scrollbar() - config.sheetSider)
        },
        popup() {
            let type = this.$store.state.sheets.popup.type
            if (type === 'validation' &&
                this.$store.getters.selectByType('DATASOURCE') == null) {
                this.$store.dispatch('SELECTS_INSERT', {
                    colAlias: this.$store.getters.allCols[0].alias,
                    rowAlias: this.$store.getters.allRows[0].alias,
                    type: 'DATASOURCE'
                })
            }
            return this.$store.state.sheets.popup
        },
        colIndex() {
            this.colArr = []
            let select = this.$store.getters.selectByType('SELECT')
            let signalSort = select.signalSort
            let startCol = signalSort.startCol
            let endCol = signalSort.endCol
            for (let i = startCol; i <= endCol; i++) {
                this.colArr.push(i)
            }
            let start = getColDisplayName(startCol)
            let end = getColDisplayName(endCol)
            return '=$' + start + ':$' + end
        },
        rowIndex() {
            this.rowArr = []
            let select = this.$store.getters.selectByType('SELECT')
            let signalSort = select.signalSort
            let startRow = signalSort.startRow
            let endRow = signalSort.endRow
            for (let i = startRow; i <= endRow; i++) {
                this.rowArr.push(i)
            }
            return '=$' + (startRow + 1) + ':$' + (endRow + 1)
        },
        cellIndex() {
            let select = this.$store.getters.selectByType('SELECT')
            let signalSort = select.signalSort
            let startRow = signalSort.startRow
            let endRow = signalSort.endRow
            let startCol = signalSort.startCol
            let endCol = signalSort.endCol
            let scol = getColDisplayName(startCol)
            let ecol = getColDisplayName(endCol)
            let ruleID = this.$store.getters.cellValidation()
            if (ruleID == null) {
                this.validationed = 0
            } else {
                let validate = this.$store.getters.validateByIndex(ruleID)
                this.validationed = validate.type
                if (validate.type === 7) {
                    this.validationed = 3
                }
                this.sort = validate.formula1
                this.ranged = validate.operator
                this.min = validate.formula1
                this.number = validate.formula1
                this.max = validate.formula2
                if (validate.operator === 5 || validate.operator === 7) {
                    this.max = validate.formula1
                }
            }
            if (endRow === -1) {
                return '=$' + scol + ':$' + ecol
            }
            if (endCol === -1) {
                return '=$' + (startRow + 1) + ':$' + (endRow + 1)
            }
            return '=$' + scol + (startRow + 1) + ':$' + ecol + (endRow + 1)
        },
        dateCellIndex() {
            let select = this.$store.getters.selectByType('DATASOURCE')
            if (select == null) {
                return this.sort
            }
            let signalSort = select.signalSort
            let startRow = signalSort.startRow
            let endRow = signalSort.endRow
            let startCol = signalSort.startCol
            let endCol = signalSort.endCol
            let scol = getColDisplayName(startCol)
            let ecol = getColDisplayName(endCol)
            if (endRow === -1) {
                this.sort = '=$' + scol + ':$' + ecol
                this.rowLength = 'MAX'
                return '=$' + scol + ':$' + ecol
            }
            if (endCol === -1) {
                this.sort = '=$' + (startRow + 1) + ':$' + (endRow + 1)
                this.colLength = 'MAX'
                return '=$' + (startRow + 1) + ':$' + (endRow + 1)
            }
            if ('=$' + scol + (startRow + 1) + ':$' + ecol + (endRow + 1) === '=$A1:$A1') {
                return ''
            }
            this.rowLength = endRow - startRow + 1
            this.colLength = endCol - startCol + 1
            this.sort = '$' + scol + '$' + (startRow + 1) + ':$' + ecol + '$' + (endRow + 1)
            return '$' + scol + '$' + (startRow + 1) + ':$' + ecol + '$' + (endRow + 1)
        },
    },
    methods: {
        typeChange() {
            this.number = ''
            this.min = ''
            this.max = ''
            this.sort = ''
            this.colLength = ''
            this.rowLength = ''
            this.ranged = 0
        },
        rangeChange() {
            this.number = ''
            this.min = ''
            this.max = ''
            this.sort = ''
            this.colLength = ''
            this.rowLength = ''
        },
        changeSelect() {
            if (this.dateSource) {
                this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
            } else {
                this.$store.commit('M_SELECT_UPDATE_STATE', 'DATASOURCE')
            }
            this.dateSource = !this.dateSource
        },
        close() {
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
            this.dateSource = false
            this.value = ''
            let ruleID = this.$store.getters.cellValidation()
            if (ruleID == null) {
                this.validationed = 0
            } else {
                let validates = this.$store.getters.validate()
                for (let k = 0, lenk = validates.length; k < lenk; k++) {
                    let validate = validates[k]
                    if (ruleID === validate.index) {
                        this.validationed = validate.type
                    }
                }
            }
            this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
            let selects = this.$store.state.selects.list
            let destroyDataSource = {}
            selects.forEach((item, index) => {
                if (item.type === 'DATASOURCE') {
                    destroyDataSource = item
                }
            })
            this.$store.dispatch('SELECTS_DELETE', {
                select: destroyDataSource
            })
        },
        adjuctValidation() {
            if (this.validationed === 0) {
                this.$store.dispatch('A_DELETE_VALIDATE')
                this.$store.commit('UPDATE_SHEET_POPUP', {
                    show: false,
                    title: '',
                    type: ''
                })
                this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
                let selects = this.$store.state.selects.list
                let destroyDataSource = {}
                selects.forEach((item, index) => {
                    if (item.type === 'DATASOURCE') {
                        destroyDataSource = item
                    }
                })
                this.$store.dispatch('SELECTS_DELETE', {
                    select: destroyDataSource
                })
                return
            }
            let selected = this.validationed
            if (selected === 3) {
                selected = this.sort.indexOf('$') > -1 && this.sort.indexOf(':') > -1 ? 7 : 3
            }
            let sendObj = {
                ranged: this.ranged,
                type: selected,
                max: this.max,
                min: this.min,
                number: this.number,
                sort: this.sort,
            }
            let reason = validateReason(sendObj)
            if (this.rowLength === 'MAX' || this.colLength === 'MAX') {
                reason = '选择范围错误！来源不可整行/整列选择！'
            }
            if (this.rowLength > 1 && this.colLength > 1) {
                reason = '选择范围错误！来源必须为单一行/列！'
            }
            if (this.validationed === 6 && (this.max < 0 || this.min < 0 || this.number < 0)) {
                reason = '文本长度错误！最大值最小值不可为负数！'
            }
            if (reason !== '') {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: reason,
                    show: true,
                    type: 'error'
                })
                return
            }
            let sendParm = validateSendPara(sendObj)
            this.$store.dispatch('A_ADD_VALIDATE', sendParm)
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
            this.$store.commit('M_SELECT_UPDATE_STATE', 'SELECT')
            let selects = this.$store.state.selects.list
            let destroyDataSource = {}
            selects.forEach((item, index) => {
                if (item.type === 'DATASOURCE') {
                    destroyDataSource = item
                }
            })
            this.$store.dispatch('SELECTS_DELETE', {
                select: destroyDataSource
            })
        },
        adjustColWidht() {
            let protect = this.$store.getters.isProtect()
            let arr = this.colArr
            let width = Number(this.value)
            if (width < 5 || width > 200) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '列宽必须大于5且小于200',
                    show: true,
                    type: 'error'
                })
                return
            }
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            for (let i = 0; i < arr.length; i++) {
                this.$store.dispatch('COLS_ADJUSTWIDTH', {
                    width,
                    index: arr[i]
                })
            }
            this.value = ''
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
        },
        adjustRowHeight() {
            //  >5 且必须为数字
            let protect = this.$store.getters.isProtect()
            let arr = this.rowArr
            let height = Number(this.value)
            if (height < 5 || height > 100) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '行高必须大于5且小于100',
                    show: true,
                    type: 'error'
                })
                return
            }
            if (protect) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    texts: '工作簿已保护，请取消保护后操作！',
                    show: true,
                    type: 'error'
                })
                return
            }
            for (let i = 0; i < arr.length; i++) {
                this.$store.dispatch('ROWS_ADJUSTHEIGHT', {
                    height,
                    index: arr[i]
                })
            }
            this.value = ''
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
        },
        adjustColor() {
            let value = this.value === '' ? '#000000' : this.value
            let color = hexToRgb(value)
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'background',
                propStruct: {
                    content: {
                        background: color
                    }
                }
            })
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
        },
    }
}
</script>
<style type="text/css">
    .book-popup{
        position: absolute;
        right: 0;
        top: 0;
        width: 280px;
        background: white;
    }
</style>