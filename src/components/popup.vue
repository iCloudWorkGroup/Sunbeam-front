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
                                <select name="type" class="">
                                    <option class="default" value="default">任意值</option>
                                    <option value="intType" class="intType">整数</option>
                                    <option value="decimalType" class="decimalType">小数</option>
                                    <option value="textType" class="textType">文本长度</option>
                                    <option value="sequenceType">序列</option></select>
                            </div>
                            <div class="range">
                                <label>最小值:</label>
                                <input type="text" name="min" class="min"><br>
                                <label>最大值:</label>
                                <input type="text" name="max" class="max">
                            </div>
                            <div class="source">
                                <label>来源:</label>
                                <input type="text" class="source-data" maxlength="50" name="source">
                                <div class="select-out"></div>
                            </div>
                        </form>
                        <div class="error">选中区域内包含多种验证规则</div>
                        <div class="oper">
                            <span class="confirm">确定</span>
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
            <div class="siderbar-body" v-show="popup.type === 'lock'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="lock-content">
                            <div class="title">
                                <span>锁定</span>
                                <div class="checkbox lock-toggle"
                                     :class="{ checked: locked }"
                                    @click="updateLock"></div>
                            </div><div class="content">
                            <label>所选区域：</label>
                            <input type="text" v-model="cellIndex" disabled="disabled">
                        </div>
                            <div class="oper">
                                <span class="confirm" @click="adjuctLock">确定</span>
                                <span class="cancel" @click="close">取消</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="siderbar-body"  v-show="popup.type === 'protect'">
                <div>
                    <div class="siderbar-item clearfix">
                        <div class="protect-content">
                            <div class="content">
                                <label>密码：</label>
                                <input v-model="password" type="password">
                            </div>
                            <div class="oper">
                                <span class="confirm" @click="updatePass">确定</span>
                                <span class="cancel" @click="close">取消</span>
                            </div>
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
            locked: true,
            password: ''
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
            this.locked = this.$store.getters.hasLockCell()
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
        close() {
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
        },
        adjustColWidht() {
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
            for (let i = 0; i < arr.length; i++) {
                this.$store.dispatch('COLS_ADJUSTWIDTH', {
                    width,
                    index: arr[i]
                })
            }
        },
        adjustRowHeight() {
            //  >5 且必须为数字
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
            for (let i = 0; i < arr.length; i++) {
                this.$store.dispatch('ROWS_ADJUSTHEIGHT', {
                    height,
                    index: arr[i]
                })
            }
        },
        adjustColor() {
            let color = this.value
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'background',
                propStruct: {
                    content: {
                        background: color
                    }
                }
            })
        },
        updateLock() {
            this.locked = !this.locked
        },
        adjuctLock() {
            this.$store.dispatch('A_CELLS_UPDATE', {
                propName: 'lock',
                propStruct: {
                    content: {
                        locked: this.locked
                    }
                }
            })
            this.$store.commit('UPDATE_SHEET_POPUP', {
                show: false,
                title: '',
                type: ''
            })
        },
        updatePass() {
            let passwd = this.password
            let protect = this.$store.getters.isProtect()
            if (passwd !== '' && (passwd.length > 18 || passwd.length < 4)) {
                this.$store.commit('M_UPDATE_PROMPT', {
                    show: true,
                    texts: '密码格式错误！密码应为空或位数限制 4-18',
                    type: 'error'
                })
                return
            }
            this.$store.dispatch('A_SHEETS_PROTECT', {
                protect: !protect,
                passwd
            })
            this.password = ''
        }
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