/**
 * 跟jquery的合并方式不同，由于模板都是公用的，
 * 所以没有做target目标的处理，都是空对象的形式
 * 虽然性能不是最佳，但是符合业务要求
 */
/**
 * [extend description]
 * @param  {[type]}    proto  [是否以第一个对象为原型合并]
 * @param  {...[type]} values [合并属性的所有对象]
 * @return {[type]}           [合并完成的对象]
 */
export default function extend(proto, ...values) {
    let target
    let i = 0
    if (typeof proto === 'boolean' && proto) {
        target = values[0]
        i++
    } else {
        values.splice(0, 0, proto)
        let dataType = toString.call(values[0]).toLowerCase()
        switch (dataType) {
            case '[object object]':
                target = {}
                break
            case '[object array]':
                target = []
                break
        }
    }
    for (let len = values.length; i < len; i++) {
        // Only deal with non-null/undefined values
        let options = values[i]

        // Extend the base object
        for (let name in options) {
            if (Object.prototype.hasOwnProperty.call(options, name)) {
                let src = target[name]
                let copy = options[name]

                // Prevent never-ending loop
                if (target === copy) {
                    continue
                }

                if (isObject(copy) && copy !== null) {
                    let clone
                    if (Array.isArray(copy)) {
                        clone = src && Array.isArray(src) ? src : []
                        clone.splice(0, clone.length, ...copy)
                    } else {
                        clone = src && isObject(src) ? src : {}
                    }
                    target[name] = extend(clone, copy)
                } else {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

function isObject(obj) {
    return typeof obj === 'object' && obj !== null
}