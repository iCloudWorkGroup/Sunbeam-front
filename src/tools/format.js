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
        reg: /^(y{4})[-/年]?(m{1,2})[-/月]?(d{1,2})[日]?$|^(y{4})[-/年]?(m{1,2})[-/月]?/g,
        handle: 'whole',
        match: true
    }, {
        reg: /0^\.|0\.0{1,3}/g,
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
    if (value === '') {
        return false
    }
    if (value.indexOf(',') === -1) {
        reg = /^(\-|\+)?[0-9]+(\.[0-9]+)?$/
    }
    return reg.test(value)
}
export function isDate(value) {
    let regularLine = /^\d{4}\/\d{1,2}\/\d{1,2}$/
    let regularWord = /^\d{4}\u5e74\d{1,2}\u6708(\d{1,2}\u65e5)?$/
    let year
    let month
    let day
    let date
    if (value === '') {
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
            return parseInt(this.origin, 10)
        },
        percent: function(rule) {
            return this.origin * 100
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
            let localDate = new Date(this.origin)
            let dateMap = {
                y: localDate.getFullYear(),
                m: localDate.getMonth() + 1,
                d: localDate.getDate()
            }
            let ret = rule.match.replace(/([ymd]+)/g, function(
                match, name) {
                let localName = name.substring(0, 1)
                return (dateMap[localName] != null) ?
                    dateMap[localName] : ''
            })
            return ret
        }
    }
    let ec = new Complier(text)
    return ec.initilize(rules)
}

