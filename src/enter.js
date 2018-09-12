import  Sunbeam from './api/sunbeam'
import send from './util/send'
import config from './config'
let ss = new Sunbeam({
    root: '#a',
    toolbar: '.tools'
})


ss.load().then(() => {
    document.addEventListener('mousemove', function (e) {
        ss.getPointByPosi('1', e.clientX, e.clientY)
    })
})

ss.addEventListener('regionChange', function (e) {
    // console.log(e.point.row.length)
    // console.log(e.point.col.length)
    // console.log(e.point.row[0])
    // console.log(e.point.col[0])
})
document.getElementById('dd').addEventListener('click', function () {
    send({
        url: config.url.comment,
        body: JSON.stringify({
            coordinate: [
                {
                    startCol: 2,
                    startRow: 3,
                    endCol: 2,
                    endRow: 3
                }
            ],
            comment: '123'
        })
    })
})
document.getElementById('clear').addEventListener('click', function () {
    send({
        url: config.url.clearqueue
    }, false)
})
