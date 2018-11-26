import Sunbeam from './api/sunbeam'
import send from './util/send'
import config from './config'
let ss = new Sunbeam({
    root: '.table',
    toolbar: '.tools'
})


ss.load().then(() => {
    ss.rowHide('1', '1')
    ss.rowHide('1', '2')
    ss.colHide('1', 'A')
})

ss.addEventListener('regionChange', function (e) {
    // ss.rowCancelHide('1', '1')
    // ss.rowCancelHide('1', '2')
    // ss.colCancelHide('1', 'A')
})
ss.addEventListener('mousedown', function (e) {
    // console.log(e)
})
document.getElementById('dd').addEventListener('click', function () {
    send({
        url: config.url.validate,
        body: JSON.stringify({
            coordinate: [
                {
                    startCol: 4,
                    startRow: 4,
                    endCol: 4,
                    endRow: 4
                }
            ],
            rule: {
                formula1: 1,
                formula2: 10,
                type: 1,
                operator: 1
            }
        })
    })
})
document.getElementById('aa').addEventListener('click', function () {
    ss.protect(true, '1111')
})
document.getElementById('clear').addEventListener('click', function () {
    ss.protect(false, '1111')
})

