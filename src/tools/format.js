import extend from '../util/extend'

export function parseExpress(str) {
    let localStr = str
    let keyRegs = [{
        reg: /#,##/g,
        decorate: 'middle'
    }, {
        reg: /%/g,
        match: true,
        decorate: 'after',
        handle: 'percent'
    }, {
        reg: /\$|¥/g,
        match: true,
        decorate: 'before'
    }, {
        reg: /^@$/g,
        handle: 'article'
    }, {
        // reg: /(y{4})[-/年]?(m{1,2})[-/月]?(d{1,2})[日]?$|(y{4})[-/年]?(m{1,2})[-/月]?/g,
        reg: /(y{4})\'[-/年]\'?(m{1,2})\'[-/月]\'?(d{1,2})\'[日]\'?$|(y{4})\'[-/年]\'?(m{1,2})\'[-/月]\'?|m\/d\/yy/g,
        handle: 'whole',
        match: true
    }, {
        reg: /0\.0{1,4}|\d/g,
        match: true,
        handle: 'decimal'
    }]
    let retRegs = []
    for (let i = 0, len = keyRegs.length; i < len; i++) {
        let item = keyRegs[i]
        let reg = item['reg']
        let ret = reg.exec(localStr)
        if (ret) {
            if (item.match) {
                item.match = ret[0]
            }
            retRegs.push(item)
            let arrayStr = localStr.split('')
            arrayStr.splice(ret.index, reg.lastIndex - ret.index)
            localStr = arrayStr.join('')
            if (!localStr.length) {
                break
            }
        }
    }
    return retRegs
}
export function isNum(value) {
    let reg
    if (value === '' || value == null) {
        return false
    }
    if (value.toString().indexOf(',') === -1) {
        reg = /^(\-|\+)?[0-9]+(\.[0-9]+)?$/
    } else {
        return false
    }
    return reg.test(value)
}
export function isPercent(value) {
    let percentReg = /^\d+(\.\d+)?%$/
    if (value === '' || value == null) {
        return false
    }
    return percentReg.test(value)
}
export function isCurrency(value) {
    let currency = /^\$\d+(\.\d+)?$|^¥\d+(\.\d+)?$|^￥\d+(\.\d+)?$/
    if (value === '' || value == null) {
        return false
    }
    return currency.test(value)
}
export function isDate(value) {
    let regularLine = /^\d{4}\/\d{1,2}\/\d{1,2}$/
    let regularWord = /^\d{4}\u5e74\d{1,2}\u6708(\d{1,2}\u65e5)?$/
    let year
    let month
    let day
    let date
    if (value === '' || value == null) {
        return false
    }
    if (!regularLine.test(value) && !regularWord.test(value)) {
        return false
    }
    year = value.match(/\d{4}/)[0]
    month = value.match(/(\/|\u5e74)\d{1,2}(\/|\u6708)/)
    if (month !== null) {
        month = month[0].substring(1, month[0].length - 1)
    }
    day = value.match(/\d{1,2}\u65e5/)

    if (day === null) {
        day = value.match(/\d{1,2}$/)
    }
    if (day !== null) {
        day = day[0].substring(0, day[0].length)
    }
    if (day !== null && day.indexOf('日') !== -1) {
        day = day.substring(0, day.length - 1)
    }

    date = new Date(year + '/' + (month || '01') + '/' + (day || '01'))
    if (parseInt(year, 10) !== date.getFullYear()) {
        return false
    }
    if (month !== null && parseInt(month, 10) !== date.getMonth() + 1) {
        return false
    }
    if (day !== null && parseInt(day, 10) !== date.getDate()) {
        return false
    }
    return true
}
export function formatText(rules, text) {
    let Complier = function(inptVal, type = '') {
        this.origin = this.manifest = this.inpt = inptVal
        this.dateType = type
    }
    Complier.prototype = {
        initilize: function(rules) {
            let calculate = function(handleType) {
                for (let i = 0, len = rules.length; i < len; i++) {
                    let item = rules[i]
                    let handleName
                    if ((handleName = item[handleType]) != null) {
                        this.manifest = this[handleName](item)
                    }
                }
            }.bind(this)
            calculate('handle')
            calculate('decorate')
            return this.manifest
        },
        /**
         * [返回数字类型]
         * @param  {[type]} rule [description]
         * @return {[number]}      [description]
         */
        decimal: function(rule) {
            // 小数变整数，四舍五入
            // 整数变小数
            // 小数变小数，四舍五入
            this.origin = parseFloat(this.origin, 10)
            let exps = rule.match
            if (exps.indexOf('.') !== -1) {
                let figure = exps.length - exps.indexOf('.') - 1
                return this.origin.toFixed(figure)
            }
            return Math.round(this.origin)
        },
        percent: function(rule) {
            this.origin = this.origin * 100
            return this.origin
        },
        article: function() {
            return this.origin.toString()
        },
        /**
         * [修饰符在中间，需要number类型]
         * @return {[String]} [description]
         */
        middle: function() {
            let originStr = this.manifest.toString()
            return originStr.indexOf('.') === -1 ?
                this.manifest.toLocaleString() :
                originStr.replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        },
        /**
         * [修饰符在前面]
         * @param  {[type]} rule [description]
         * @return {[String]}      [description]
         */
        before: function(rule) {
            return rule.match + this.manifest
        },
        /**
         * [修饰符在后面, 但要计算数据值]
         * @param  {[type]} rule [description]
         * @return {[String]}      [description]
         */
        after: function(rule) {
            return this.manifest + rule.match
        },
        whole: function(rule) {
            let reg = /^\d{4}\u5e74\d{1,2}\u6708(\d{1,2}\u65e5)?$/
            if (reg.test(this.origin)) {
                this.origin = this.origin.replace(/\u5e74|\u6708|\u65e5/g, '/')
            }
            let match = rule.match
            if (rule.match === 'm/d/yy') {
                match = 'yyyy/m/d'
            }
            let localDate = new Date(this.origin)
            let dateMap = {
                y: localDate.getFullYear(),
                m: (localDate.getMonth() + 1),
                d: localDate.getDate()
            }
            let ret = match.replace(/([ymd]+)/g, function(
                match, name) {
                let localName = name.substring(0, 1)
                return (dateMap[localName] != null) ?
                    dateMap[localName] : ''
            })
            ret = ret.replace(/\'/g, '')
            return ret
        }
    }
    let ec = new Complier(text)
    return ec.initilize(rules)
}
// 分解命名空间, 返回合并好的对象
export function pathToStruct({
    structName,
    value
}) {
    let namespaces = structName.split('.')
    let propStruct = {}
    let item = null // 组建临时对象
    for (let k = 0, spaceLen = namespaces.length; k < spaceLen; k++) {
        if (item == null) {
            item = propStruct
        }
        item[namespaces[k]] = k !== spaceLen - 1 ? {} : value
        item = item[namespaces[k]]
    }
    return propStruct
}

export function parsePropStruct(cell, formatObj, texts, row, col) {
    let fixObj = { content: {}}
    fixObj.date = false
    if ((!cell || cell.content.express === '' || cell.content.express === 'General') &&
        (typeof col === 'undefined' || col.express === '' || col.express === 'General') &&
        (typeof row === 'undefined' || row.express === '' || row.express === 'General')) {
        fixObj.content.alignRowFormat = formatObj.autoAlign
        fixObj.content.express = formatObj.autoRecExpress
        fixObj.content.texts = formatObj.autoRecText
        fixObj.recType = formatObj.autoRecType
    } else {
        let express
        let type
        if (cell) {
            express = cell.content.express
            type = cell.content.type
        } else if (col.express !== 'General') {
            express = col.express
            type = col.type
        } else {
            express = row.express
            type = row.type
        }
        if (express === '@') {
            fixObj.content.texts = texts
            fixObj.content.alignRowFormat = 'left'
        } else if ((type === 'number' || type === 'percent' || type === 'currency') && formatObj.autoRecType === 'date') {
            fixObj.content.texts = 0
            fixObj.content.alignRowFormat = 'right'
        } else if (type === 'date' && (formatObj.autoRecType === 'number' || formatObj.autoRecType === 'percent' || formatObj.autoRecType === 'currency')) {
            if (express === 'm/d/yy') {
                fixObj.content.texts = '1970/1/1'
            }
            if (express === 'yyyy"年"m"月"d"日"') {
                fixObj.content.texts = '1970年1月1日'
            }
            if (express === 'yyyy"年"m"月"') {
                fixObj.content.texts = '1970年1月'
            }
            fixObj.content.alignRowFormat = 'right'
            fixObj.date = true
        } else {
            fixObj.content.alignRowFormat = formatObj.autoAlign
            fixObj.content.texts = formatObj.autoRecText
        }
        fixObj.content.express = express
        fixObj.content.type = type
    }
    return fixObj
}

export function parseType(texts) {
    let formatObj = {
        autoRecExpress: 'General',
        autoRecType: 'routine',
        autoRecText: texts,
        autoAlign: 'right',
    }
    if (isPercent(texts)) {
        formatObj.autoRecExpress = '0.00%'
        formatObj.autoRecType = 'percent'
        formatObj.autoRecText = texts.replace(/\%/, '') / 100
        if (formatObj.autoRecText.toString().indexOf('.') > -1) {
            formatObj.autoRecText = formatObj.autoRecText.toFixed(4)
        }
    } else if (isCurrency(texts)) {
        formatObj.autoRecExpress = texts.indexOf('$') > -1 ? '$#,##0.00' : '¥#,##0.00'
        formatObj.autoRecType = 'currency'
        formatObj.autoRecText = Number(texts.replace(/\$|¥|￥/, '')).toString()
        if (formatObj.autoRecText.indexOf('.') > -1) {
            formatObj.autoRecText = parseFloat(formatObj.autoRecText).toFixed(2)
        }
    } else if (isNum(texts)) {
        formatObj.autoRecType = 'number'
        formatObj.autoRecText = Number(texts).toString()
    } else if (isDate(texts)) {
        formatObj.autoRecType = 'date'
        if (texts.indexOf('/') > -1) {
            formatObj.autoRecExpress = 'm/d/yy'
        } else if (texts.indexOf('日') > -1) {
            formatObj.autoRecExpress = 'yyyy"年"m"月"d"日"'
        } else {
            formatObj.autoRecExpress = 'yyy"年"m"月"'
        }
    } else {
        formatObj.autoRecType = 'text'
    }
    return formatObj
}


export function parseAddAglin(format) {
    let align
    if (format === 'text') {
        align = {
            content: {
                alignRowFormat: 'left'
            }
        }
    } else if (format === 'number' || format === 'percent' || format === 'currency' || format === 'routine' || format === 'data') {
        align = {
            content: {
                alignRowFormat: 'right'
            }
        }
    }
    return align
}

export function parseText(cell, format, rules, express) {
    let texts = cell.content.texts
    let displayTexts = texts
    let alignRowFormat
    let fixFormat = format
    let fixExpress = express
    let fixRules = rules
    // 强制修改文本内容
    if (format === 'number' || format === 'percent' || format === 'currency') {
        if (isDate(texts)) {
            texts = 0
        }
        if (isNum(texts)) {
            texts = texts - 0
            displayTexts = formatText(rules, parseFloat(texts, 10))
        }
        if (isCurrency(texts)) {
            texts = Number(texts.replace(/\$|¥|￥/, '')).toString()
            displayTexts = formatText(rules, parseFloat(texts, 10))
        }
        if (isPercent(texts)) {
            texts = (texts.replace(/\%/, '') / 100).toString()
            displayTexts = formatText(rules, parseFloat(texts, 10))
        }
    } else if (format === 'routine') {
        if (isDate(texts)) {
            displayTexts = formatText(rules, texts)
        } else if (isNum(texts)) {
            texts = texts - 0
            displayTexts = formatText(rules, parseFloat(texts, 10))
        } else if (isCurrency(texts)) {
            fixFormat = 'currency'
            if (texts.indexOf('$') > -1) {
                fixExpress = '$#,##0.00'
            } else {
                fixExpress = '¥#,##0.00'
            }
            texts = Number(texts.replace(/\$|¥|￥/, '')).toString()
            fixRules = parseExpress(fixFormat + '-' + fixExpress)
            displayTexts = formatText(fixRules, parseFloat(texts, 10))
        } else if (isPercent(texts)) {
            fixFormat = 'percent'
            fixExpress = '0.00%'
            texts = (texts.replace(/\%/, '') / 100).toString()
            fixRules = parseExpress(fixFormat + '-' + fixExpress)
            displayTexts = formatText(fixRules, parseFloat(texts, 10))
        }
    } else if (format === 'date') {
        if (isNum(texts)) {
            if (express === 'm/d/yy') {
                texts = '1970/1/1'
            }
            if (express === 'yyyy"年"m"月"d"日"') {
                texts = '1970年1月1日'
            }
            if (express === 'yyyy"年"m"月"') {
                texts = '1970年1月'
            }
        }
        if (isDate(texts)) {
            displayTexts = formatText(rules, texts)
        }
    }
    // 判断对齐方式
    if (fixFormat === 'text') {
        alignRowFormat = 'left'
    } else if ((fixFormat === 'number' || fixFormat === 'percent' || fixFormat === 'currency' || fixFormat === 'routine') && (isNum(texts) || texts === '')) {
        alignRowFormat = 'right'
    } else if ((fixFormat === 'date' || fixFormat === 'routine') && (isDate(texts) || texts === '')) {
        alignRowFormat = 'right'
    } else {
        alignRowFormat = 'left'
    }

    return extend({
        content: {
            texts,
            displayTexts,
            alignRowFormat,
            type: fixFormat,
            express: fixExpress
        }
    })
}

export function hexToRgb(hex) {
    return 'rgb(' + parseInt('0x' + hex.slice(1, 3), 16) + ', ' + parseInt('0x' + hex.slice(3, 5), 16) + ', ' + parseInt('0x' + hex.slice(5, 7), 16) + ')'
}