import * as A_types from '../store/action-types'
import * as M_types from '../store/mutation-types'
import App from '../app'
import {
    pathToStruct
} from '../tools/format'
import extend from '../util/extend'
import cache from '../tools/cache'
import config from '../config'
import Vue from  'vue'
import Book from '../components/book.vue'
import Main from '../toolbar/components/main.vue'

let SpreadSheet = function(options) {
    this.handlers = {}
    this.rootSelector = options.root
    this.toolbarSelector = options.toolbar
}
SpreadSheet.prototype = {
    async load() {
        await App({
            root: this.rootSelector,
            toolbar: this.toolbarSelector
        }).then(function(vms) {
            this.vm = vms.bookVm
            this.bookVm = vms.toolBarVm
        }.bind(this))
    },

    // 获取字母对应数值
    getLetterNum(str) {
        let num = 0
        let arr = str.split('')
        arr.forEach((value, index) => {
            num += (str.charCodeAt(str.length - index - 1) - 64) *
                Math.pow(26, index)
        })
        return num - 1
    },

    // 获取point区间   返回值 { startRow : startRow,endRow : endRow,startCol : startCol,endCol : endCol}
    getPoint(point) {
        console.log(point)
        // 设开始行列初始值
        let startRowIndex = 0
        let endRowIndex = -1
        let startColIndex = 0
        let endColIndex = -1

        // 判断传入单行单列或单点
        if (typeof point === 'string') {
            let regNumber = /^\d*$/

            // 正则判断数字与大写字母
            let regLetter = /^[A-Z]*$/

            // 判断传入数字，表示传入行
            if (regNumber.test(point)) {
                startRowIndex = endRowIndex = Number(point) - 1

                // 判断传入字母，表示传入列
            } else if (regLetter.test(point)) {
                let num = 0
                num = this.getLetterNum(point)
                startColIndex = endColIndex = num
            } else {
                // 分割数字与字母
                let letter = point.match(/^[A-Z]+/gi).toString()
                let number = point.match(/\d+$/gi)
                let num = 0
                num = this.getLetterNum(letter)
                startRowIndex = endRowIndex = Number(number) - 1
                startColIndex = endColIndex = num
            }
        } else { // point传入数组
            // 判断数组  console.log(Array.prototype.isPrototypeOf(point))
            let letter = []
            let number = []
            let _this = this
            point.forEach((value, index) => {
                letter[index] = _this.getLetterNum(value.match(
                    /^[A-Z]+/gi).toString())
                number[index] = Number(value.match(/\d+$/gi)) - 1
            })
            startRowIndex = number[1] > number[0] ? number[0] : number[1]
            endRowIndex = number[1] < number[0] ? number[0] : number[1]
            startColIndex = letter[1] > letter[0] ? letter[0] : letter[1]
            endColIndex = letter[1] < letter[0] ? letter[0] : letter[1]
        }
        let select = {}
        let startRow = this.vm.$store.getters.allRows[startRowIndex]
        let endRow = this.vm.$store.getters.allRows[endRowIndex]
        let startCol = this.vm.$store.getters.allCols[startColIndex]
        let endCol = this.vm.$store.getters.allCols[endColIndex]
        select.wholePosi = {
            startColAlias: startCol.alias,
            startRowAlias: startRow.alias,
            endColAlias: endCol.alias,
            endRowAlias: endRow.alias
        }
        select.activePosi = {
            rowAlias: startRow.alias,
            colAlias: startCol.alias
        }
        select.signalSort = {
            startCol: startCol.sort,
            startRow: startRow.sort,
            endCol: endCol.sort,
            endRow: endRow.sort
        }
        return select
    },

    // 修改字体样式、颜色、背景色
    setFont(select, propStruct, propName) {
        console.log(select)
        this.vm.$store.dispatch(A_types.CELLS_UPDATE, {
            propName: propName,
            propStruct: propStruct,
            coordinate: select
        })
    },

    // 修改单元格文本格式
    setTextFormat(select, type) {
        this.vm.$store.dispatch(A_types.CELLS_FORMAT, {
            coordinate: select,
            value: type
        })
    },

    // 设置字体颜色
    setFontColor(color, point) {
        let select = this.getPoint(point)
        this.setFont(select, {
            content: {
                color: color
            }
        }, 'color')
    },

    // 设置单元格背景
    setFillColor(color, point) {
        let select = this.getPoint(point)
        this.setFont(select, {
            content: {
                background: color
            }
        }, 'background')
    },

    // 批量设置单元格背景色
    batchFillBg(color, points) {
        points.forEach((point, index) => {
            let select = this.getPoint([point.startCol + point.startRow,
                point.endCol + point.endRow
            ])
            this.setFont(select, {
                content: {
                    background: color
                }
            }, 'background')
        })
    },

    // 设置字体类型
    setFontFamily(name, point) {
        let select = this.getPoint(point)
        this.setFont(select, {
            content: {
                family: name
            }
        }, 'family')
    },

    // 设置字体大小
    setFontSize(size, point) {
        let select = this.getPoint(point)
        this.setFont(select, {
            content: {
                size: size
            }
        }, 'size')
    },

    // 字体加粗
    setFontWeight(weight, point) {
        let select = this.getPoint(point)
        let bool
        if (weight === 'blod') {
            bool = true
        } else {
            bool = false
        }
        this.setFont(select, {
            content: {
                weight: bool
            }
        }, 'weight')
    },

    //  字体倾斜
    setFontStyle(style, point) {
        let select = this.getPoint(point)
        let bool
        if (style === 'italic') {
            bool = true
        } else {
            bool = false
        }
        this.setFont(select, {
            content: {
                italic: bool
            }
        }, 'italic')
    },

    // 设置单元格边框
    setCellBorder(border, point) {
        let select = this.getPoint(point)
        let structName = 'border.' + border
        let value = border === 'none' ? 0 : 1
        let propStruct = {}
        if (structName === 'border.all') {
            let toward = ['top', 'right', 'bottom', 'left']
            for (let i = 0, len = toward.length; i < len; i++) {
                let item = pathToStruct({
                    structName: 'border.' + toward[i],
                    value
                })
                propStruct = extend(propStruct, item)
            }
        } else {
            propStruct = pathToStruct({
                structName,
                value
            })
        }
        this.setFont(select, propStruct, 'border')
    },

    // 设置文本对齐方式
    setAlign(align, point) {
        let select = this.getPoint(point)
        if (align === 'left' || align === 'right' || align === 'center') {
            this.setFont(select, {
                content: {
                    alignRow: align
                }
            }, 'alignRow')
        } else {
            this.setFont(select, {
                content: {
                    alignCol: align
                }
            }, 'alignCol')
        }
    },

    // 设置单元格内容为常规类型
    setNormalType(point) {
        let select = this.getPoint(point)
        this.setTextFormat(select, 'routine-G')
    },

    // 设置单元格内容为文本类型
    setTextType(point) {
        let select = this.getPoint(point)
        this.setTextFormat(select, 'text-@')
    },

    // 设置单元格内容为数字类型
    setNumType(thousands, decimal, point) {
        let select = this.getPoint(point)
        let str = 'number-0'
        let sp = '.'
        for (let i = 0; i < decimal; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        this.setTextFormat(select, str)
    },

    // 设置单元格内容为日期类型
    setDateType(dateFormat, point) {
        let select = this.getPoint(point)
        this.setTextFormat(select, 'date-' + dateFormat)
    },

    // 设置单元格内容为百分比类型
    setPercentType(decimal, point) {
        let select = this.getPoint(point)
        let str = 'percent-0'
        let sp = '.'
        for (let i = 0; i < decimal; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        str += '%'
        this.setTextFormat(select, str)
    },

    // 设置单元格内容为货币类型
    setCoinType(decimal, sign, point) {
        let select = this.getPoint(point)
        let str = 'currency-' + sign + '#,##0'
        let sp = '.'
        for (let i = 0; i < decimal; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        this.setTextFormat(select, str)
    },

    // 合并单元格
    mergeCell(point) {
        let select = this.getPoint(point)
        this.vm.$store.dispatch(A_types.A_CELLS_MERGE, select)
    },

    // 拆分单元格
    splitCell(point) {
        let select = this.getPoint(point)
        this.vm.$store.dispatch(A_types.A_CELLS_SPLIT, select)
    },

    // 设置单元格文本内容（每次只能设置一个单元格的文本）
    setCellContent(text, point) {
        let select = this.getPoint(point)
        this.setFont(select, {
            content: {
                displayTexts: text,
                texts: text
            }
        }, 'texts')
    },

    // 冻结窗口
    frozen(point) {
        let p = this.getPoint(point)
        this.vm.$store.dispatch(A_types.SHEET_FROZEN, {
            startColIndex: p.startCol,
            endColIndex: p.endCol,
            startRowIndex: p.startRow,
            endRowIndex: p.endRow,
        })
    },

    // 解冻冻结
    unFrozen() {
        this.vm.$store.dispatch(A_types.SHEET_UNFROZEN)
    },

    // 冻结视图区域首列
    colFrozen() {
        this.vm.$store.dispatch(A_types.SHEET_FROZEN, 'firstColFrozen')
    },

    // 冻结视图区域首行
    rowFrozen() {
        this.vm.$store.dispatch(A_types.SHEET_FROZEN, 'firstRowFrozen')
    },

    // 设置列的宽度（冻结状态不可用）
    setColWidth(col, width) {
        let colIdx = this.getLetterNum(col)
        this.vm.$store.dispatch(A_types.COLS_ADJUSTWIDTH, {
            index: colIdx,
            width: width
        })
    },

    // 设置行的高度（冻结状态不可用）
    setRowHeight(row, height) {
        let rorIdx = Number(row) - 1
        this.vm.$store.dispatch(A_types.ROWS_ADJUSTHEIGHT, {
            index: rorIdx,
            height: height
        })
    },

    // 获取冻结状态
    getFrozenState() {
        console.log('函数被弃置！')
    },

    // 自适应容器大小，使用js调整spreadsheet容器大小时，调用该方法，触发自适应大小
    adaptScreen() {
        let name = this.vm.$store.state.name
        let offsetWidth = document.querySelector(name).offsetWidth
        let offsetHeight = document.querySelector(name).offsetHeight
        this.vm.$store.commit('M_UPDATE_OFFSETWIDTH', offsetWidth)
        this.vm.$store.commit('M_UPDATE_OFFSETHEIGHT', offsetHeight)
    },

    //  获取相应坐标下单元格的文本
    getTextByCoordinate(point) {
        let select = this.getPoint(point)
        let s = this.vm.$store.getters.cellsByVertical({
            startColIndex: select.signalSort.startCol,
            endColIndex: select.signalSort.endCol,
            startRowIndex: select.signalSort.startRow,
            endRowIndex: select.signalSort.endRow
        })[0]
        return s.content.displayTexts
    },

    // 鼠标选择操作状态切换为数据源操作状态
    setDataSourceState() {
        this.vm.$store.commit(M_types.M_SELECT_UPDATE_STATE, 'dateSource')
    },

    // 鼠标选择操作状态切换为普通选中操作状态
    setSelectState() {
        this.vm.$store.commit(M_types.M_SELECT_UPDATE_STATE, 'select')
    },

    // 销毁数据源选区
    destroyDataSoure() {
        let selects = this.vm.$store.state.selects.list
        let destroyDataSource = {}
        selects.forEach((item, index) => {
            if (item.type === 'DATESOURCE') {
                destroyDataSource = item
            }
        })
        this.vm.$store.commit(M_types.DELETE_SELECT, {
            select: destroyDataSource
        })
    },

    // 使用相对于浏览器页面坐标获取在表格中行列位置
    getPointByPosi(clientX, clientY) {
        let colIndex = String.fromCharCode(this.vm.$store.getters.getColIndexByPosi(
            clientX) + 65)
        let rowIndex = this.vm.$store.getters.getRowIndexByPosi(clientY) +
            1
        return {
            point: {
                col: colIndex,
                row: rowIndex
            }
        }
    },

    // 设置批注内容
    modifyComment(comment, point) {
        this.getPoint(point)
        console.log('empty')
    },

    // 弹出新增批注窗口
    createAddCommentView() {
        console.log('empty')
    },

    // 弹出编辑批注窗口
    createEditComment() {
        console.log('empty')
    },

    // 删除批注
    deleteComment(point) {
        console.log('empty')
    },

    // 添加行（冻结状态不可用）
    addRow(row) {
        let r = Number(row) - 1
        this.vm.$store.dispatch(A_types.ROWS_INSERTROW, r)
    },

    // 删除行（冻结状态不可用）
    deleteRow(row) {
        let r = Number(row) - 1
        this.vm.$store.dispatch(A_types.ROWS_DELETEROW, r)
    },

    // 添加列（冻结状态不可用）
    addCol(col) {
        let c = this.getLetterNum(col)
        this.vm.$store.dispatch(A_types.COLS_INSERTCOL, c)
    },

    // 删除列（冻结状态不可用）
    deleteCol(col) {
        let c = this.getLetterNum(col)
        this.vm.$store.dispatch(A_types.COLS_DELETECOL, c)
    },

    // 隐藏行（冻结状态不可用）
    rowHide(row) {
        let rowIdx = Number(row) - 1
        this.vm.$store.dispatch(A_types.ROWS_HIDE, rowIdx
        )
    },

    // 取消隐藏行（冻结状态不可用）
    rowCancelHide(row) {
        let rowIdx = Number(row) - 1
        this.vm.$store.dispatch(A_types.ROWS_CANCELHIDE, rowIdx)
    },

    // 隐藏列（冻结状态不可用）
    colHide(col) {
        let colIdx = this.getLetterNum(col)
        this.vm.$store.dispatch(A_types.COLS_HIDE, colIdx)
    },

    // 取消隐藏列（冻结状态不可用）
    colCancelHide(col) {
        let colIdx = this.getLetterNum(col)
        this.vm.$store.dispatch(A_types.COLS_CANCELHIDE, colIdx)
    },

    // 自定义监听事件
    addEventListener(event, callback) {
        let key
        if (!this.handlers[event]) {
            this.handlers[event] = []
        }
        if (!cache.evenetList[event]) {
            cache.evenetList[event] = []
        }
        if (!callback.listener) {
            callback.listener = []
        }
        if (typeof callback === 'function') {
            key = this.handlers[event].length
            this.handlers[event][key] = callback
        }
        if (typeof callback === 'function') {
            key = cache.evenetList[event].length
            cache.evenetList[event][key] = callback
        }
        // cache.evenetList
    },

    // 手动触发方法
    trigger(event, e) {
        if (this.handlers[event]) {
            for (let i = 0; i < this.handlers[event].length; i++) {
                // 修改上下文环境，回调函数this指向构造函数(不修改时回调函数指向window)
                this.handlers[event][i].apply(this)
            }
        }
    },

    // 事件解绑
    removeEventListener(event, callback) {
        if (!callback) {
            this.handlers[event] = []
            cache.evenetList[event] = []
            return
        }

        if (callback && this.handlers[event]) {
            for (let key in this.handlers[event]) {
                if (this.handlers[event][key] === callback) {
                    this.handlers[event].splice(key, 1)
                }
            }
        }
        if (callback && cache.evenetList[event]) {
            for (let key in cache.evenetList[event]) {
                if (cache.evenetList[event][key] === callback) {
                    cache.evenetList[event].splice(key, 1)
                }
            }
        }
    },

    // 获取前端向后台发送的操作步骤，初始值为0，当刷新界面或调用reload方法时归0
    getStep() {
        return cache.step
    },

    // 重新加载所有数据，表格会进行局部刷新，并滚动回初始位置
    reload() {
        // 销毁vue实例
        this.vm.$destroy()
        this.toolBarVm.$destroy()
        let bottom = this.vm.$el.offsetHeight + config.scrollBufferHeight
        let right = this.vm.$el.offsetWidth + config.scrollBufferWidth
        // // 清空 store 行 列 单元格 sheet select 信息
        this.vm.$store.commit(M_types.M_CLEAR_CELLS)
        this.vm.$store.commit(M_types.M_CLEAR_SELECT)
        this.vm.$store.commit(M_types.M_CLEAR_SHEET)
        this.vm.$store.commit(M_types.M_CLEAR_ROWS)
        this.vm.$store.commit(M_types.M_CLEAR_COLS)

        let rootSelector = this.root
        let toolsSelector = this.toolbar
        // 重新获取数据
        this.vm.$store.dispatch(A_types.RESTORE, {
            left: 0,
            top: 0,
            right,
            bottom
        }).then(() => {
            // 设置初始宽度
            let offsetWidth = document.querySelector(rootSelector).offsetWidth
            let offsetHeight = document.querySelector(rootSelector).offsetHeight
            this.vm.$store.commit('M_UPDATE_OFFSETWIDTH', offsetWidth)
            this.vm.$store.commit('M_UPDATE_OFFSETHEIGHT', offsetHeight)
            let store = this.vm.$store
            // 新建vue实例table
            this.vm = new Vue({
                store,
                render: h => h(Book)
            }).$mount(rootSelector)
            // 新建vue实例tools
            this.toolBarVm = new Vue({
                store,
                render: h => h(Main)
            }).$mount(toolsSelector)
        })
    },

    // 清空队列
    clearQueue() {
        cache.step = 0
        this.vm.$store.dispatch(A_types.A_CLEAR_QUEUE)
    }
}
// window.spreadSheet = SpreadSheet
export default SpreadSheet