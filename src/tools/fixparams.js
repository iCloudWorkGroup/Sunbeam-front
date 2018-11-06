import extend from '../util/extend'
import {
    isNum
} from './format'

export function fixCellUpdateSend(propStruct, propName, signalSort) {
    let sendArgs = {
        coordinate: [signalSort]
    }
    let fixText
    switch (propName) {
        case 'wordWrap':
            sendArgs = extend(sendArgs, {
                auto: propStruct.content[propName]
            })
            if (propStruct.row) {
                sendArgs = extend(sendArgs, {
                    effect: [{
                        row: propStruct.row.index,
                        offset: propStruct.row.height
                    }]
                })
            }
            break
        case 'texts':
            fixText = addTextSign(propStruct.content[propName], propStruct)
            sendArgs = extend({
                coordinate: signalSort
            }, {
                content: fixText
            })
            break
        case 'alignRow':
        case 'alignCol':
            sendArgs = extend(sendArgs, {
                align: propStruct.content[propName]
            })
            break
        case 'background':
            sendArgs = extend(sendArgs, {
                color: propStruct.content[propName]
            })
            break
        case 'comment':
            sendArgs = extend(sendArgs, {
                [propName]: propStruct.customProp[propName]
            })
            break
        case 'recomment':
            sendArgs = extend(sendArgs)
            break
        case 'lock':
            sendArgs = extend(sendArgs, {
                lock: propStruct.content.locked
            })
            break
        default:
            sendArgs = extend(sendArgs, {
                [propName]: propStruct.content[propName]
            })
            break
    }
    return sendArgs
}

function addTextSign(text, propStruct) {
    let fixText = text
    if (propStruct.content.express === '$#,##0.00' && isNum(fixText)) {
        fixText = '$' + fixText
    }
    if (propStruct.content.express === '¥#,##0.00' && isNum(fixText)) {
        fixText = '¥' + fixText
    }
    if (propStruct.content.express === '0.00%' && isNum(fixText)) {
        fixText = fixText * 100 + '%'
    }
    return fixText
}