import Sunbeam from './api/sunbeam.js'
let ss = new Sunbeam({
    root: '.table',
    toolbar: '.tools'
})
ss.load().then(() => {
    ss.setFontColor('rgb(255,0,0)', 'C1')
})
ss.addEventListener('regionChange', function (point) {
    console.log(point)
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