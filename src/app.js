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
import './directors/focus'
export default async function(options) {
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
    let bottom = $rootEl.offsetHeight + config.scrollBufferHeight
    let right = $rootEl.offsetWidth + config.scrollBufferWidth
    store.commit('M_SET_CLASS', rootSelector)
    let toolBarVm
    let bookVm
    await store.dispatch(RESTORE, {
        left: 0,
        top: 0,
        right,
        bottom
    })
    // 修正每次滚动加载的距离，让每次加载的距离大于触发加载值 100
    // 这样可以保证，每次加完成后，每个加载宽肯定会大于用户的触发limit值
    cache.prestrainHeight = Math.max(cache.prestrainHeight, bottom +
        100)
    cache.prestrainWidth = Math.max(cache.prestrainWidth, right +
        100)

    bookVm = new Vue({
        store,
        render: h => h(Book)
    }).$mount(rootSelector)
    if (toolSelector != null) {
        store.registerModule('toolbar', toolbar)
        toolBarVm = new Vue({
            store,
            render: h => h(Main)
        }).$mount(toolSelector)
    }
    // 初始化offset宽高
    let offsetWidth = document.querySelector(rootSelector).offsetWidth
    let offsetHeight = document.querySelector(rootSelector).offsetHeight
    store.commit('M_UPDATE_OFFSETWIDTH', offsetWidth)
    store.commit('M_UPDATE_OFFSETHEIGHT', offsetHeight)
    return {
        bookVm,
        toolBarVm
    }
}