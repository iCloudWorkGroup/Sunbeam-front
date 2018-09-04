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
    this.loadStatus = true
}
SpreadSheet.prototype = {
    async load() {
        if (this.loadStatus === true) {
            await App({
                root: this.rootSelector,
                toolbar: this.toolbarSelector
            }).then(function(vms) {
                this.loadStatus = false
                this.vm = vms.bookVm
                this.bookVm = vms.toolBarVm
            }.bind(this))
        }
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
                num = this.getLetterNum(letter.toUpperCase())
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
                    /^[A-Z]+/gi).toString().toUpperCase())
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
        this.vm.$store.dispatch(A_types.A_CELLS_UPDATE, {
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
    setFontColor(sheetId, color, point) {
        let clo
        let p
        if (arguments.length === 2) {
            clo = sheetId
            p = color
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            clo = color
            p = point
        }
        let select = this.getPoint(p)
        this.setFont(select, {
            content: {
                color: clo
            }
        }, 'color')
    },

    // 设置单元格背景
    setFillColor(sheetId, color, point) {
        let clo
        let p
        if (arguments.length === 2) {
            clo = sheetId
            p = color
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            clo = color
            p = point
        }
        let select = this.getPoint(p)
        this.setFont(select, {
            content: {
                background: clo
            }
        }, 'background')
    },

    // 批量设置单元格背景色
    batchFillBg(sheetId, color, points) {
        let clo
        let p
        if (arguments.length === 2) {
            clo = sheetId
            p = color
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            clo = color
            p = points
        }
        p.forEach((point, index) => {
            let select = this.getPoint([point.startCol + point.startRow,
                point.endCol + point.endRow
            ])
            this.setFont(select, {
                content: {
                    background: clo
                }
            }, 'background')
        })
    },

    // 设置字体类型
    setFontFamily(sheetId, name, point) {
        let nm
        let p
        if (arguments.length === 2) {
            nm = sheetId
            p = name
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            nm = name
            p = point
        }
        let select = this.getPoint(p)
        this.setFont(select, {
            content: {
                family: nm
            }
        }, 'family')
    },

    // 设置字体大小
    setFontSize(sheetId, size, point) {
        let sz
        let p
        if (arguments.length === 2) {
            sz = sheetId
            p = size
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            sz = size
            p = point
        }
        let select = this.getPoint(p)
        this.setFont(select, {
            content: {
                size: sz
            }
        }, 'size')
    },

    // 字体加粗
    setFontWeight(sheetId, weight, point) {
        let wg
        let p
        if (arguments.length === 2) {
            wg = sheetId
            p = weight
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            wg = weight
            p = point
        }
        let select = this.getPoint(p)
        let bool
        if (wg === 'bold') {
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
    setFontStyle(sheetId, style, point) {
        let st
        let p
        if (arguments.length === 2) {
            st = sheetId
            p = style
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            st = style
            p = point
        }
        let select = this.getPoint(p)
        let bool
        if (st === 'italic') {
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

    // 下划线
    setFontUnderline(sheetId, underline, point) {
        let ul
        let p
        if (arguments.length === 2) {
            ul = sheetId
            p = underline
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            ul = underline
            p = point
        }
        let select = this.getPoint(p)
        let bool
        if (ul === 'underline') {
            bool = true
        } else {
            bool = false
        }
        this.setFont(select, {
            content: {
                underline: bool
            }
        }, 'underline')
    },

    // 设置单元格边框
    setCellBorder(sheetId, border, point) {
        let bd
        let p
        if (arguments.length === 2) {
            bd = sheetId
            p = border
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            bd = border
            p = point
        }
        let select = this.getPoint(p)
        let structName = 'border.' + bd
        let value = bd === 'none' ? 0 : 1
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
    setAlign(sheetId, align, point) {
        let al
        let p
        if (arguments.length === 2) {
            al = sheetId
            p = align
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            al = align
            p = point
        }
        let select = this.getPoint(p)
        if (al === 'left' || al === 'right' || al === 'center') {
            this.setFont(select, {
                content: {
                    alignRow: al
                }
            }, 'alignRow')
        } else {
            this.setFont(select, {
                content: {
                    alignCol: al
                }
            }, 'alignCol')
        }
    },

    // 设置单元格内容为常规类型
    setNormalType(sheetId, point) {
        let p
        if (arguments.length === 1) {
            p = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            p = point
        }
        let select = this.getPoint(p)
        this.setTextFormat(select, 'routine-G')
    },

    // 设置单元格内容为文本类型
    setTextType(sheetId, point) {
        let p
        if (arguments.length === 1) {
            p = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            p = point
        }
        let select = this.getPoint(p)
        this.setTextFormat(select, 'text-@')
    },

    // 设置单元格内容为数字类型
    setNumType(sheetId, thousands, decimal, point) {
        let p
        let deci
        if (arguments.length === 3) {
            deci = thousands
            p = decimal
        }
        if (arguments.length === 4 && typeof arguments[0] === 'string') {
            deci = decimal
            p = point
        }
        let select = this.getPoint(p)
        let str = 'number-0'
        let sp = '.'
        for (let i = 0; i < deci; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        this.setTextFormat(select, str)
    },

    // 设置单元格内容为日期类型
    setDateType(sheetId, dateFormat, point) {
        let p
        let date
        if (arguments.length === 2) {
            date = sheetId
            p = dateFormat
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            date = dateFormat
            p = point
        }
        let select = this.getPoint(p)
        this.setTextFormat(select, 'date-' + date)
    },

    // 设置单元格内容为百分比类型
    setPercentType(sheetId, decimal, point) {
        let p
        let deci
        if (arguments.length === 2) {
            deci = sheetId
            p = decimal
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            deci = decimal
            p = point
        }
        let select = this.getPoint(p)
        let str = 'percent-0'
        let sp = '.'
        for (let i = 0; i < deci; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        str += '%'
        this.setTextFormat(select, str)
    },

    // 设置单元格内容为货币类型
    setCoinType(sheetId, decimal, sign, point) {
        let p
        let deci
        let s
        if (arguments.length === 3) {
            deci = sheetId
            s = decimal
            p = sign
        }
        if (arguments.length === 4 && typeof arguments[0] === 'string') {
            deci = decimal
            s = sign
            p = point
        }
        let select = this.getPoint(p)
        let str = 'currency-' + s + '#,##0'
        let sp = '.'
        for (let i = 0; i < deci; i++) {
            sp += 0
        }
        if (sp !== '.') {
            str += sp
        }
        this.setTextFormat(select, str)
    },

    // 合并单元格
    mergeCell(sheetId, point) {
        let p
        if (arguments.length === 1) {
            p = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            p = point
        }
        let select = this.getPoint(p)
        this.vm.$store.dispatch(A_types.A_CELLS_MERGE, select)
    },

    // 拆分单元格
    splitCell(sheetId, point) {
        let p
        if (arguments.length === 1) {
            p = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            p = point
        }
        let select = this.getPoint(p)
        this.vm.$store.dispatch(A_types.A_CELLS_SPLIT, select)
    },

    // 设置单元格文本内容（每次只能设置一个单元格的文本）
    setCellContent(sheetId, text, point) {
        let p
        let txt
        if (arguments.length === 2) {
            txt = sheetId
            p = text
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            txt = text
            p = point
        }
        let select = this.getPoint(p)
        this.setFont(select, {
            content: {
                displayTexts: txt,
                texts: txt
            }
        }, 'texts')
    },

    // 冻结窗口
    frozen(sheetId, point) {
        console.log('empty')
        // let p = this.getPoint(point)
        // this.vm.$store.dispatch(A_types.SHEET_FROZEN, {
        //     startColIndex: p.startCol,
        //     endColIndex: p.endCol,
        //     startRowIndex: p.startRow,
        //     endRowIndex: p.endRow,
        // })
    },

    // 解冻冻结
    unFrozen() {
        console.log('empty')
        // this.vm.$store.dispatch(A_types.SHEET_UNFROZEN)
    },

    // 冻结视图区域首列
    colFrozen() {
        console.log('empty')
        // this.vm.$store.dispatch(A_types.SHEET_FROZEN, 'firstColFrozen')
    },

    // 冻结视图区域首行
    rowFrozen() {
        console.log('empty')
        // this.vm.$store.dispatch(A_types.SHEET_FROZEN, 'firstRowFrozen')
    },

    // 设置列的宽度（冻结状态不可用）
    setColWidth(sheetId, col, width) {
        let c
        let w
        if (arguments.length === 2) {
            c = sheetId
            w = col
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            c = col
            w = width
        }
        let colIdx = this.getLetterNum(c)
        this.vm.$store.dispatch(A_types.COLS_ADJUSTWIDTH, {
            index: colIdx,
            width: w
        })
    },

    // 设置行的高度（冻结状态不可用）
    setRowHeight(sheetId, row, height) {
        let r
        let h
        if (arguments.length === 2) {
            r = sheetId
            h = row
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            r = row
            h = height
        }
        let rorIdx = Number(r) - 1
        this.vm.$store.dispatch(A_types.ROWS_ADJUSTHEIGHT, {
            index: rorIdx,
            height: h
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
    getTextByCoordinate(sheetId, point) {
        let p
        if (arguments.length === 1) {
            p = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            p = point
        }
        let select = this.getPoint(p)
        let s = this.vm.$store.getters.cellsByVertical({
            startColIndex: select.signalSort.startCol,
            endColIndex: select.signalSort.endCol,
            startRowIndex: select.signalSort.startRow,
            endRowIndex: select.signalSort.endRow
        })[0]
        return s.content.texts
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
    getPointByPosi(sheetId, clientX, clientY) {
        let x
        let y
        if (arguments.length === 2) {
            x = sheetId
            y = clientX
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            x = clientX
            y = clientY
        }
        let colIndex = String.fromCharCode(this.vm.$store.getters.getColIndexByPosi(
            x) + 65)
        let rowIndex = this.vm.$store.getters.getRowIndexByPosi(y) +
            1
        return {
            point: {
                col: colIndex,
                row: rowIndex
            }
        }
    },

    // 设置批注内容
    modifyComment(sheetId, comment, point) {
        let p
        let com
        if (arguments.length === 2) {
            com = sheetId
            p = comment
        }
        if (arguments.length === 3 && typeof arguments[0] === 'string') {
            p = point
            com = comment
        }
        this.getPoint(p)
        console.log('empty' + com)
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
    deleteComment(sheetId, point) {
        console.log('empty')
    },

    // 添加行（冻结状态不可用）
    addRow(sheetId, row) {
        let r
        if (arguments.length === 1) {
            r = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            r = row
        }
        let rowIdx = Number(r) - 1
        this.vm.$store.dispatch(A_types.ROWS_INSERTROW, rowIdx)
    },

    // 删除行（冻结状态不可用）
    deleteRow(sheetId, row) {
        let r
        if (arguments.length === 1) {
            r = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            r = row
        }
        let rowIdx = Number(r) - 1
        this.vm.$store.dispatch(A_types.ROWS_DELETEROW, rowIdx)
    },

    // 添加列（冻结状态不可用）
    addCol(sheetId, col) {
        let c
        if (arguments.length === 1) {
            c = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            c = col
        }
        let colIdx = this.getLetterNum(c)
        this.vm.$store.dispatch(A_types.COLS_INSERTCOL, colIdx)
    },

    // 删除列（冻结状态不可用）
    deleteCol(sheetId, col) {
        let c
        if (arguments.length === 1) {
            c = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            c = col
        }
        let colIdx = this.getLetterNum(c)
        this.vm.$store.dispatch(A_types.COLS_DELETECOL, colIdx)
    },

    // 隐藏行（冻结状态不可用）
    rowHide(sheetId, row) {
        let r
        if (arguments.length === 1) {
            r = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            r = row
        }
        let rowIdx = Number(r) - 1
        let rows = this.vm.$store.getters.allRows
        if (!rows[rowIdx].hidden) {
            this.vm.$store.dispatch(A_types.ROWS_HIDE, rowIdx)
        }
    },

    // 取消隐藏行（冻结状态不可用）
    rowCancelHide(sheetId, row) {
        let r
        if (arguments.length === 1) {
            r = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            r = row
        }
        let rowIdx = Number(r) - 1
        this.vm.$store.dispatch(A_types.ROWS_CANCELHIDE, rowIdx)
    },

    // 隐藏列（冻结状态不可用）
    colHide(sheetId, col) {
        let c
        if (arguments.length === 1) {
            c = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            c = col
        }
        let colIdx = Number(c) - 1
        let cols = this.vm.$store.getters.allCols
        if (!cols[colIdx].hidden) {
            this.vm.$store.dispatch(A_types.COLS_HIDE, colIdx)
        }
    },

    // 取消隐藏列（冻结状态不可用）
    colCancelHide(sheetId, col) {
        let c
        if (arguments.length === 1) {
            c = sheetId
        }
        if (arguments.length === 2 && typeof arguments[0] === 'string') {
            c = col
        }
        let colIdx = this.getLetterNum(c)
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