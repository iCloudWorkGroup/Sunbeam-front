import Sunbeam from './api/sunbeam'
import send from './util/send'
import config from './config'
let ss = new Sunbeam({
    root: '.table',
    toolbar: '.tools'
})


ss.load().then(() => {
    // ss.rowCancelHide('1', '1')
    // ss.rowCancelHide('1', '2')
    // ss.colCancelHide('1', 'A')
    // ss.colHide('1', 'A').then(() => {
    //     return ss.rowHide('1', '1')
    // }).then(() => {
    //     return ss.rowHide('1', '2')
    // }).then(() => {
    //     // ss.reload()
    // })
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
        url: config.url.clean,
        body: JSON.stringify({
            coordinate: [
                {
                    startCol: 3,
                    endCol: 5,
                    startRow: 2,
                    endRow: 3
                }
            ]
        })
    })
})
document.getElementById('aa').addEventListener('click', function () {
    ss.rowCancelHide('1', '1')
    ss.rowCancelHide('1', '2')
    ss.colCancelHide('1', 'A')
})
document.getElementById('clear').addEventListener('click', function () {
    ss.rowHide('1', '1')
    ss.rowHide('1', '2')
    ss.colHide('1', 'A')
})

