import  Sunbeam from './api/sunbeam'
import send from './util/send'
import config from './config'
let ss = new Sunbeam({
    root: '#a',
    toolbar: '.tools'
})


ss.load().then(() => {

})

ss.addEventListener('regionChange', function (e) {
    // console.log(e.point.row.length)
    // console.log(e.point.col.length)
    // console.log(e.point.row[0])
    // console.log(e.point.col[0])
})
document.getElementById('dd').addEventListener('click', function () {
    ss.setRowHeight('1', 20).then(() => {
        return ss.setRowHeight('2', 20)
    }).then(() => {
        ss.setColWidth('A', 70).then(() => {
            setTimeout(ss.reload(), 1000)
        })
    })
})
document.getElementById('aa').addEventListener('click', function () {
    ss.setRowHeight('1', 0)
    ss.setRowHeight('2', 0)
    ss.setColWidth('A', 0)
})
document.getElementById('clear').addEventListener('click', function () {
    send({
        url: config.url.clearqueue
    }, false)
})