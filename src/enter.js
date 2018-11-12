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
    ss.batchFillBg('transparent', [{ startCol: 'D', endCol: 'F', startRow: 4, endRow: 5 }, { startCol: 'B', endCol: 'C', startRow: 10, endRow: 12 }])
})
document.getElementById('aa').addEventListener('click', function () {
    ss.lock([{ startCol: 'C', endCol: 'D', startRow: 3, endRow: 4 }, { startCol: 'E', endCol: 'H', startRow: 11, endRow: 12 }], false)
    ss.batchFillBg('#ccc', [{ startCol: 'C', endCol: 'D', startRow: 3, endRow: 4 }, { startCol: 'E', endCol: 'H', startRow: 11, endRow: 12 }])
    ss.protect(true, '1111')
})
document.getElementById('clear').addEventListener('click', function () {
    ss.protect(false, '1111')
})

