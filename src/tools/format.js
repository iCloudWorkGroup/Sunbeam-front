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
        reg: /(y{4})\"[-/年]\"?(m{1,2})\"[-/月]\"?(d{1,2})\"[日]\"?$|(y{4})\"[-/年]\"?(m{1,2})\"[-/月]\"?|m\/d\/yy/g,
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
    let currency = /^\$\d+(\.\d+)?$|^¥\d+(\.\d+)?$/
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
            ret = ret.replace(/\"/g, '')
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

export function parseFormat(texts, cell) {
    let inputExpress = ''
    let fixText
    if (isPercent(texts) && (!cell || cell.content.express === 'General' || cell.content.express === 'G')) {
        inputExpress = '0.00%'
        fixText = texts.replace(/\%/, '') / 100
        if (fixText.toString().indexOf('.') > -1) {
            fixText = fixText.toFixed(4)
        }
    } else if (isCurrency(texts) && (!cell || cell.content.express === 'General' || cell.content.express === 'G')) {
        inputExpress = texts.indexOf('¥') > -1 ? '¥#,##0.00' : '$#,##0.00'
        fixText = texts.replace(/\$|¥/, '')
        if (fixText.toString().indexOf('.') > -1) {
            fixText = parseFloat(fixText).toFixed(2)
        }
    } else {
        fixText = texts
    }
    return {
        fixText,
        inputExpress
    }
}

export function parseAlign(express, fixText, texts) {
    let align
    if (express === '@') {
        align = 'left'
    } else if ((express === 'G' || express === 'General' || express === '0' || express === '0.0' || express === '0.00' || express === '0.000'
        || express === '0.0000' || express === '0.00%' || express === '$#,##0.00' || express === '¥#,##0.00')
        && isNum(fixText)) {
        align = 'right'
    } else if ((express === 'm/d/yy' || express === 'yyyy"年"m"月"d"日"' || express === 'yyyy"年"m"月"' || express === 'G' || express === 'General') && isDate(texts)) {
        align = 'right'
    }
    return align
}

export function parsePropStruct(cell, propStruct, texts) {
    let parseCell = parseFormat(texts, cell)
    let inputExpress = parseCell.inputExpress
    let fixText = parseCell.fixText
    let express
    let date = false
    if (cell) {
        // 当原本express为常规时，根据输入类型修改express
        if (cell.content.express === 'G' || cell.content.express === 'General') {
            express = inputExpress
            propStruct.content = {
                texts: fixText,
                express,
                // type: 'percent'
            }
        } else {
            express = cell.content.express
            date = cell.content.express === 'm/d/yy' || cell.content.express === 'yyyy"年"m"月"d"日"' || cell.content.express === 'yyyy"年"m"月"' ? true : false
            propStruct.content = {
                texts: fixText,
            }
        }
    } else {
        express = inputExpress === '' ? 'G' : inputExpress
        propStruct.content = {
            texts: fixText,
            express
        }
    }
    let align = parseAlign(express, fixText, texts)
    return {
        propStruct,
        fixText,
        align,
        date,
        express
    }
}