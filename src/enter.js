import Sunbeam from './api/sunbeam.js'
let ss = new Sunbeam({
    root: '#a',
    toolbar: '.tools'
})
ss.load().then(() => {
    // ss.setRowHeight('2', '30')
})



ss.addEventListener('mousedown', function (point) {
    // console.log(point.point)
})
document.getElementById('dd').addEventListener('click', function () {
    ss.setDataSourceState()
})
document.getElementById('aa').addEventListener('click', function () {
    ss.setSelectState()
    ss.destroyDataSoure()
})


// ss.on('reginchange', function(ret) {
//     console.log('24')
// })
// console.log(ss.rootSelector)
// ss.addEventListener('regionChange', function (point) {
//     console.log(point)
// })