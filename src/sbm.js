import './css/main.css'
import Vue from 'vue'
import store from './store'
import Book from './components/book.vue'
import dataloader from './tools/dataloader'
// import font from './entrance/font'
import cache from './tools/cache'
import { RESTORE } from './store/action-types'
// 后期需要进行修改
window.SPREADSHEET_AUTHENTIC_KEY = '9e417dc6-e85d-45cd-991f-577b642cfb81'

function SBM(selector) {
    let $rootEl = cache.rootEl = document.querySelector(selector)
    dataloader({
        left: 0,
        top: 0,
        right: $rootEl.offsetWidth,
        bottom: $rootEl.offsetHeight
    }, function(data) {
        store.dispatch(RESTORE, data)
    })
    new Vue({
        store,
        render: h => h(Book)
    }).$mount(selector)
    // font(this, store)
}

export default SBM