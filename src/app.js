import './css/main.css'
import Vue from 'vue'
import store from './store'
import Book from './components/book.vue'
import Main from './toolbar/components/main.vue'
import toolbar from './toolbar/store'
import cache from './tools/cache'
import {
    RESTORE
} from './store/action-types'
import config from './config'
export default function(options) {
    // 用户参数合法性验证
    cache.AUTHENTIC_KEY = document.getElementById('auth_key').value
    let rootSelector = options.root
    let $rootEl
    if (rootSelector != null &&
        ($rootEl = document.querySelector(rootSelector)) != null) {
        cache.rootEl = $rootEl
    } else {
        throw new Error('rootEl not exist')
    }
    // 可选参数过滤
    let toolSelector = options.toolbar
    let $toolEl
    if (toolSelector != null &&
        ($toolEl = document.querySelector(toolSelector)) != null) {
        cache.toolEl = $toolEl
    }
    // 发送restore请求
    store.dispatch(RESTORE, {
        left: 0,
        top: 0,
        right: $rootEl.offsetWidth + config.prestrainWidth,
        bottom: $rootEl.offsetHeight + config.prestrainHeight
    }).then(() => {
        new Vue({
            store,
            render: h => h(Book)
        }).$mount(rootSelector)
        if (toolSelector != null) {
            store.registerModule('toolbar', toolbar)
            new Vue({
                store,
                render: h => h(Main)
            }).$mount(toolSelector)
        }
    }).then(() => {
        // console.log('open api')
    })
}