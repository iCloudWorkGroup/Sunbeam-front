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
                                <select v-model="selected" @change="update">
                                    <option v-for="select in selects" :value="select.value">{{ select.text }}</option>
                                </select>
                            </div>
                            <div class="range" v-show="selected !== 'sequenceType' && selected !== 'default'">
                                <label>最小值:</label>
                                <input type="text" name="min" class="min" v-model="min"><br>
                                <label>最大值:</label>
                                <input type="text" name="max" class="max" v-model="max">
                            </div>
                            <div class="source" v-show="selected === 'sequenceType'">
                                <label>来源:</label>
                                <input type="text" class="source-data"
                                        maxlength="50" name="source"
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
    hexToRgb
} from '../tools/format'
import {
    getColDisplayName
} from '../util/displayname'
import scrollbar from '../util/scrollbar'
import config from '../config'
export default {
    data() {
        return {
            colArr: [],
            rowArr: [],
            value: '',
            selected: 'default',
            max: '',
            min: '',
            sort: '',
            selects: [
                { value: 'default', text: '任意值' },
                { value: 'intType', text: '整数' },
                { value: 'decimalType', text: '小数' },
                { value: 'textType', text: '文本长度' },
                { value: 'sequenceType', text: '序列' },
            ],
            dateSource: false,
        }
    },
    computed: {
        height() {
            return unit(this.$store.getters.offsetHeight - scrollbar() - config.sheetSider)
        },
        popup() {
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
                this.selected = 'default'
            } else {
                let validates = this.$store.getters.validate()
                for (let k = 0, lenk = validates.length; k < lenk; k++) {
                    let validate = validates[k]
                    if (ruleID === validate.index) {
                        if (validate.rule.type === 1) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'intType'
                        }
                        if (validate.rule.type === 2) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'decimalType'
                        }
                        if (validate.rule.type === 3) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'textType'
                        }
                        if (validate.rule.type === 4) {
                            this.selected = 'sequenceType'
                        }
                    }
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
                return ''
            }
            let signalSort = select.signalSort
            let startRow = signalSort.startRow
            let endRow = signalSort.endRow
            let startCol = signalSort.startCol
            let endCol = signalSort.endCol
            let scol = getColDisplayName(startCol)
            let ecol = getColDisplayName(endCol)
            if (endRow === -1) {
                return '=$' + scol + ':$' + ecol
            }
            if (endCol === -1) {
                return '=$' + (startRow + 1) + ':$' + (endRow + 1)
            }
            return '=$' + scol + (startRow + 1) + ':$' + ecol + (endRow + 1)
        },
    },
    methods: {
        update() {
            this.min = ''
            this.max = ''
            this.sort = '123'
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
                this.selected = 'default'
            } else {
                let validates = this.$store.getters.validate()
                for (let k = 0, lenk = validates.length; k < lenk; k++) {
                    let validate = validates[k]
                    if (ruleID === validate.index) {
                        if (validate.rule.type === 1) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'intType'
                        }
                        if (validate.rule.type === 2) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'decimalType'
                        }
                        if (validate.rule.type === 3) {
                            this.min = validate.rule.formula1
                            this.max = validate.rule.formula2
                            this.selected = 'textType'
                        }
                        if (validate.rule.type === 4) {
                            this.selected = 'sequenceType'
                        }
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