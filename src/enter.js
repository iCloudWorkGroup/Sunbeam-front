import Sunbeam from './api/sunbeam'
import send from './util/send'
import config from './config'
let ss = new Sunbeam({
    root: '.table',
    toolbar: '.tools'
})


ss.load().then(() => {
    console.log('over')
    ss.rowHide('1', '1')
    ss.rowHide('1', '2')
    ss.colHide('1', 'A')
    // ss.colHide('1', 'A').then(() => {
    //     return ss.rowHide('1', '1')
    // }).then(() => {
    //     return ss.rowHide('1', '2')
    // }).then(() => {
    //     // ss.reload()
    // })
})

ss.addEventListener('regionChange', function (e) {
    // console.log(e.point.row.length)
    // console.log(e.point.col.length)
    // console.log(e.point.row[0])
    // console.log(e.point.col[0])
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
    ss.reload()
})
document.getElementById('clear').addEventListener('click', function () {
    ss.colHide('1', 'A').then(() => {
        return ss.rowHide('1', '1')
    }).then(() => {
        return ss.rowHide('1', '2')
    }).then(() => {
        // ss.reload()
    })
})
