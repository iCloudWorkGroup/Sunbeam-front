import Sunbeam from './api/sunbeam.js'
let ss = new Sunbeam({
    root: '#a',
    toolbar: '.tools'
})
ss.load().then(() => {
    ss.setColWidth('A', 0)
    ss.setRowHeight('1', 0)
    ss.setRowHeight('2', 0)
})

ss.addEventListener('regionChange', function (e) {
    console.log(e.point.row.length)
    console.log(e.point.col.length)
    console.log(e.point.row[0])
    console.log(e.point.col[0])
})
document.getElementById('dd').addEventListener('click', function () {
    ss.setDataSourceState()
})
document.getElementById('aa').addEventListener('click', function () {
    ss.setSelectState()
    ss.destroyDataSoure()
})
