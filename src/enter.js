import  Sunbeam from './api/sunbeam'
// import send from './util/send'
// import config from './config'
let ss = new Sunbeam({
    root: '#a',
    toolbar: '.tools'
})


ss.load().then(() => {
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
document.getElementById('dd').addEventListener('click', function () {
    // ss.colHide('1', 'A').then(() => {
    //     return ss.rowHide('1', '1')
    // }).then(() => {
    //     return ss.rowHide('1', '2')
    // }).then(() => {
    //     // ss.reload()
    // })
    ss.adaptScreen()
    ss.clearQueue()
    ss.reload()
})
document.getElementById('aa').addEventListener('click', function () {
    ss.colCancelHide('1', 'A').then(() => {
        return ss.rowCancelHide('1', '1')
    }).then(() => {
        return ss.rowCancelHide('1', '2')
    }).then(() => {
        // ss.reload()
    })
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
