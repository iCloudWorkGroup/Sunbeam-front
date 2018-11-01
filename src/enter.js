import Sunbeam from './api/sunbeam'
// import send from './util/send'
// import config from './config'
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
    ss.batchFillBg('#123456', [{ startCol: 'D', endCol: 'F', startRow: 4, endRow: 5 }, { startCol: 'B', endCol: 'C', startRow: 10, endRow: 12 }])
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

